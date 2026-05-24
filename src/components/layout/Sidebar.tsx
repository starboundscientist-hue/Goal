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

const navBase = 'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors w-full text-left';
const navInactive = 'text-zinc-400 hover:text-zinc-100 hover:bg-surface-hover';
const navActive = 'text-zinc-100 bg-surface-hover';

export function Sidebar() {
  const { llmOnline, lastGitScan } = useStore();

  const openLogger = () => {
    window.dispatchEvent(new CustomEvent('open-logger'));
  };

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-surface-border bg-surface-base">
      <div className="px-4 py-5 flex items-center gap-2">
        <span className="text-blue-400 text-base">{'\u25c9'}</span>
        <span className="font-semibold text-zinc-100 tracking-tight">GOAL OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        <NavLink to="/" end className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Dashboard
        </NavLink>

        <button onClick={openLogger} className={`${navBase} ${navInactive}`}>
          Log Session
          <span className="ml-auto text-xs text-zinc-600">{'\u2318'}K</span>
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="text-xs uppercase tracking-wider text-zinc-600 font-medium">Clusters</span>
        </div>

        {CLUSTER_NAV.map(({ id, label, symbol }) => (
          <NavLink
            key={id}
            to={`/cluster/${id}`}
            className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}
          >
            <span className="text-xs font-mono w-4 text-center" style={{ color: CLUSTER_COLORS[id] }}>
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

      <div className="px-4 py-3 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${llmOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={`text-xs ${llmOnline ? 'text-zinc-600' : 'text-amber-500'}`}>
            {llmOnline ? 'Ollama online' : 'Ollama offline'}
          </span>
        </div>
        {lastGitScan && (
          <div className="text-xs text-zinc-700 mt-0.5">
            Git: synced {relativeTime(lastGitScan)}
          </div>
        )}
      </div>
    </aside>
  );
}
