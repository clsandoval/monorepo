import { useState, useEffect, useCallback } from 'react';

interface FileAutocompleteProps {
  query: string;           // text after @
  files: string[];          // flat list of file paths
  onSelect: (path: string) => void;
  onDismiss: () => void;
}

export function FileAutocomplete({ query, files, onSelect, onDismiss }: FileAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const matches = files
    .filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, matches.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (matches[selectedIndex]) {
          onSelect(matches[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    },
    [matches, selectedIndex, onSelect, onDismiss],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (matches.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-1 w-full max-w-md bg-surface-2 border border-default rounded-md shadow-md overflow-hidden z-40 animate-fade-in-up">
      {matches.map((file, i) => (
        <button
          key={file}
          onMouseDown={(e) => { e.preventDefault(); onSelect(file); }}
          className={`w-full text-left px-3 py-1.5 font-mono text-xs transition-colors ${
            i === selectedIndex ? 'bg-surface-3 text-text-primary' : 'text-text-secondary hover:bg-surface-3'
          }`}
        >
          {file}
        </button>
      ))}
    </div>
  );
}
