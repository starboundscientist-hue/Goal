import { NavLink } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { CLUSTER_COLORS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';

const CLUSTER_NAV = [
  { id: 'foundations', label: 'Foundations', symbol: '\u2297' },
  { id: 'alpha',       label: 'Frontier AI',  symbol: '\u03b1' },
  { id: 'beta',        label: 'Embodied AI',  symbol: '\u03b2' },
  { id: 'gamma',       label: 'Embedded',     symbol: '\u03b3' },
  { id: 'delta',       label: 'Comp Physics', symbol: '\u03b4' },
  { id: 'epsilon',     label: 'Infra',        symbol: '\u03b5' },
] as const;

const navBase = 'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all w-full text-left';
const navInactive = 'text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]';
const navActive = 'text-foreground bg-white/[0.06] border border-surface-border/40';

export function Sidebar() {
  const { llmOnline, lastGitScan, theme, toggleTheme } = useStore();

  const openLogger = () => {
    window.dispatchEvent(new CustomEvent('open-logger'));
  };

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-surface-border/40 bg-surface-base/80 backdrop-blur-xl">
      <div className="px-4 py-5 flex items-center gap-2">
        <span className="text-blue-400/80 text-base">{'\u25c9'}</span>
        <span className="font-semibold text-foreground/90 tracking-tight">GOAL OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        <NavLink to="/" end className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Dashboard
        </NavLink>

        <button onClick={openLogger} className={`${navBase} ${navInactive}`}>
          Log Session
          <span className="ml-auto text-[10px] text-muted-foreground/40 font-mono">{'\u2318'}K</span>
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium">Clusters</span>
        </div>

        {CLUSTER_NAV.map(({ id, label, symbol }) => (
          <NavLink
            key={id}
            to={`/cluster/${id}`}
            className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}
          >
            <span className="text-xs font-mono w-4 text-center opacity-70" style={{ color: CLUSTER_COLORS[id] }}>
              {symbol}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-3" />
        <NavLink to="/work" className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Work Tracker
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Weekly Review
        </NavLink>
      </nav>

      <div className="px-4 py-3 border-t border-surface-border/30 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${llmOnline ? 'bg-emerald-400/70' : 'bg-amber-400/70'}`} />
          <span className={`text-xs ${llmOnline ? 'text-muted-foreground/50' : 'text-amber-500/70'}`}>
            {llmOnline ? 'AI online' : 'AI offline'}
          </span>
        </div>
        {lastGitScan && (
          <div className="text-[10px] text-muted-foreground/30 mt-0.5">
            Git: synced {relativeTime(lastGitScan)}
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors w-full"
        >
          {theme === 'dark' ? '\u2600' : '\u263D'}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </aside>
  );
}
