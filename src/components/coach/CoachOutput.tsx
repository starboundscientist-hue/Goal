import { useState, useEffect, useRef } from 'react';

interface Props {
  text: string;
  speed?: number;
}

export function CoachOutput({ text, speed = 18 }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const lines = displayed.split('\n');

  return (
    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
      {lines.map((line, i) => {
        const isSectionHeader = /^[A-Z][A-Z\s]{3,}$/.test(line.trim());
        const isActionLine = line.trim().startsWith('\u2192');
        return (
          <div key={i} className={
            isSectionHeader ? 'text-zinc-100 font-semibold mt-4 mb-1' :
            isActionLine ? 'text-blue-400 mt-1' :
            'text-zinc-300'
          }>
            {line || '\u00a0'}
          </div>
        );
      })}
    </div>
  );
}
