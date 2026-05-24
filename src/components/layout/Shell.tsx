import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useStore } from '../../lib/store';

interface Props {
  children: React.ReactNode;
}

export function Shell({ children }: Props) {
  const location = useLocation();
  const { llmOnline, progress } = useStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {progress && !llmOnline && !bannerDismissed && (
          <div className="flex items-center justify-between px-4 py-2 bg-amber-950/60 border-b border-amber-900/50 text-amber-400 text-xs flex-shrink-0">
            <span>
              <span className="font-semibold mr-1">Ollama offline.</span>
              Semantic parsing and git classification unavailable — manual entry only.
              Start Ollama with <code className="font-mono bg-amber-950 px-1 rounded">ollama serve</code> to enable.
            </span>
            <button
              onClick={() => setBannerDismissed(true)}
              className="ml-4 text-amber-600 hover:text-amber-400 leading-none"
              aria-label="Dismiss"
            >
              {'×'}
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="min-h-full px-8 py-6 max-w-5xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
