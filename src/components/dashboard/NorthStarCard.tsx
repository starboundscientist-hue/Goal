import { useEffect, useState, type ReactNode } from 'react';
import { loadMotivation } from '../../lib/api';
import type { MotivationData } from '../../lib/types';

function renderInline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-foreground/90 font-medium">{part}</strong> : part
  );
}

function renderBlock(text: string): ReactNode {
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs.map((para, i) => {
    const lines = para.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return null;

    if (lines.every(l => l.trimStart().startsWith('- '))) {
      return (
        <ul key={i} className="list-disc list-inside space-y-0.5">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.trimStart().slice(2))}</li>
          ))}
        </ul>
      );
    }

    if (lines.every(l => l.trimStart().startsWith('>'))) {
      return (
        <blockquote
          key={i}
          className="border-l-2 border-blue-400/40 pl-3 text-foreground/60 italic"
        >
          {lines.map((l, j) => (
            <div key={j}>{renderInline(l.trimStart().replace(/^>\s?/, ''))}</div>
          ))}
        </blockquote>
      );
    }

    return (
      <p key={i}>
        {lines.map((l, j) => (
          <span key={j}>
            {j > 0 && ' '}
            {renderInline(l)}
          </span>
        ))}
      </p>
    );
  });
}

export function NorthStarCard() {
  const [data, setData] = useState<MotivationData | null>(null);

  useEffect(() => {
    loadMotivation().then(setData);
  }, []);

  if (!data) return null;

  const latest = data.entries.length > 0 ? data.entries[data.entries.length - 1] : null;

  return (
    <div className="mb-6 bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-4">
      <h2 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 mb-2">
        North Star
      </h2>
      <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
        {renderBlock(data.northStar)}
      </div>

      {latest && (
        <div className="mt-3 pt-3 border-t border-surface-border/30">
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 mb-1">
            Latest · {latest.date}
          </div>
          <div className="text-xs text-muted-foreground/70 leading-relaxed space-y-1.5">
            {renderBlock(latest.body)}
          </div>
        </div>
      )}
    </div>
  );
}
