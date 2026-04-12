"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, User, Download, Star } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

interface SearchResult {
  id: string;
  type: 'creator' | 'template' | 'tool';
  name: string;
  avatar?: string;
  stats?: { downloads: number; likes: number };
  href: string;
}

const mockResults: SearchResult[] = [
  { id: '1', type: 'creator', name: 'Alex Rivera', avatar: '/avatar1.jpg', stats: { downloads: 247, likes: 892 }, href: '/creator/alex' },
  { id: '2', type: 'template', name: 'Neon UI Kit', stats: { downloads: 1.2, likes: 456 }, href: '/template/neon-ui' },
  { id: '3', type: 'tool', name: 'Cyberpunk Shader', stats: { downloads: 890, likes: 234 }, href: '/tool/shader' },
  { id: '4', type: 'creator', name: 'Luna Voss', avatar: '/avatar2.jpg', stats: { downloads: 567, likes: 1234 }, href: '/creator/luna' },
  { id: '5', type: 'template', name: 'Holographic HUD', stats: { downloads: 345, likes: 678 }, href: '/template/hud' },
];

export default function FloatingSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Hotkey to open search
  useHotkeys('/', () => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, { preventDefault: true });

  // Close on Escape
  useHotkeys('Escape', () => {
    setIsOpen(false);
    setQuery('');
  }, { enabled: isOpen });

  // Keyboard navigation
  useHotkeys('ArrowDown', () => {
    if (isOpen && results.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % results.length);
    }
  }, { enabled: isOpen });

  useHotkeys('ArrowUp', () => {
    if (isOpen && results.length > 0) {
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  }, { enabled: isOpen });

  useHotkeys('Enter', () => {
    if (isOpen && results.length > 0) {
      window.location.href = results[selectedIndex].href;
    }
  }, { enabled: isOpen });

  // Search logic
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      return;
    }

    const filtered = mockResults.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const ResultIcon = ({ type }: { type: SearchResult['type'] }) => {
    const icons = {
      creator: User,
      template: Download,
      tool: Star,
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4 flex-shrink-0 text-nebula-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl mx-auto pointer-events-auto"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
          >
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-nebula-500/20 via-white/5 to-aurora/20 backdrop-blur-xl border border-white/20 shadow-glow-lg" />
              <div className="relative rounded-2xl bg-black/50 border border-white/20 backdrop-blur-3xl shadow-2xl shadow-nebula-500/40 overflow-hidden">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search creators, templates, tools... (↑↓ to navigate, ⏎ to open)"
                  className="w-full h-16 pl-14 pr-6 text-lg font-medium text-white/95 bg-transparent border-none outline-none placeholder-white/60 focus:placeholder-white/40"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/50 text-sm">
                  <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs">/</kbd>
                  <span>⌨️</span>
                </div>
              </div>
            </div>

            {/* Results Dropdown */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  ref={resultsRef}
                  className="mt-2 max-h-96 overflow-y-auto rounded-2xl bg-black/60 border border-white/20 backdrop-blur-3xl shadow-2xl shadow-nebula-500/30"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                        index === selectedIndex ? 'bg-nebula-500/20 ring-2 ring-nebula-400/50' : ''
                      }`}
                      onClick={() => {
                        window.location.href = result.href;
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm shadow-glow-xs`}>
                        <ResultIcon type={result.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{result.name}</div>
                        <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                          <span className="capitalize">{result.type}</span>
                          {result.stats && (
                            <>
                              <span>•</span>
                              <span>{result.stats.downloads} downloads</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/50 ml-auto flex-shrink-0" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No results */}
            {query.length > 0 && results.length === 0 && (
              <motion.div
                className="mt-2 p-8 text-center rounded-2xl bg-black/40 border border-white/20 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Search className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-white/60">Try different keywords for creators, templates, or tools</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



