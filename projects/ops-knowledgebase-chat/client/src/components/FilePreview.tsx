import { useState, useEffect, useCallback } from 'react';
import hljs from 'highlight.js';

interface FilePreviewProps {
  filePath: string;
  onClose: () => void;
}

export function FilePreview({ filePath, onClose }: FilePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/files/${filePath}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(setContent)
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [filePath]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const highlighted = content
    ? (() => {
        try {
          const ext = filePath.split('.').pop() || '';
          const lang = hljs.getLanguage(ext) ? ext : undefined;
          return lang
            ? hljs.highlight(content, { language: lang }).value
            : hljs.highlightAuto(content).value;
        } catch {
          return content;
        }
      })()
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-1 border border-default rounded-lg shadow-md w-[80vw] max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-default">
          <span className="font-mono text-sm text-text-secondary">{filePath}</span>
          <button onClick={onClose} className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading && <div className="text-text-muted text-sm">Loading...</div>}
          {!loading && content === null && <div className="text-text-muted text-sm">File not found</div>}
          {!loading && content !== null && (
            <pre className="text-xs text-code-text font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlighted }} />
          )}
        </div>
      </div>
    </div>
  );
}
