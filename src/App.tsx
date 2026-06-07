import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { ClusterPage } from './pages/ClusterPage';
import { LogPage } from './pages/LogPage';
import { WorkPage } from './pages/WorkPage';
import { WeeklyPage } from './pages/WeeklyPage';
import { SemanticLogger } from './components/logging/SemanticLogger';
import { useStore } from './lib/store';
import * as api from './lib/api';

export default function App() {
  const { setProgress, setWork, setLlmOnline, setPendingGitEntries, setLastGitScan, theme } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    Promise.allSettled([api.loadProgress(), api.loadWork(), api.checkAI()])
      .then(([progressResult, workResult, aiResult]) => {
        if (progressResult.status === 'fulfilled') setProgress(progressResult.value);
        if (workResult.status === 'fulfilled') setWork(workResult.value);
        setLlmOnline(aiResult.status === 'fulfilled' ? aiResult.value : false);
      });
  }, []);

  useEffect(() => {
    const runScan = async () => {
      try {
        const groups = await api.runGitScan();
        if (groups.length === 0) return;

        const pending = await Promise.all(
          groups.map(async (group) => {
            const text = `Repo: ${group.repo}\nCommits:\n${group.commits.join('\n')}`;
            const parsed = await api.parseText(text);
            return {
              id: `git_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              commit_group: group,
              parsed: parsed || undefined
            };
          })
        );

        setPendingGitEntries(pending);
        setLastGitScan(new Date());
      } catch {
        // git scan failed — server not ready or GIT_AUTHOR_EMAIL not set
      }
    };

    runScan();
    const interval = setInterval(runScan, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cluster/:id" element={<ClusterPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/review" element={<WeeklyPage />} />
        </Routes>
      </Shell>
      <SemanticLogger />
    </BrowserRouter>
  );
}
