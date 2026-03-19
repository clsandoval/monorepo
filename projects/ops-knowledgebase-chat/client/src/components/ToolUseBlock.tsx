import { useState } from 'react';
import type { ToolUseEntry } from '../types';

interface ToolUseBlockProps {
  entry: ToolUseEntry;
}

export function ToolUseBlock({ entry }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const inputSummary = typeof entry.input === 'object' && entry.input !== null
    ? Object.entries(entry.input as Record<string, unknown>)
        .map(([k, v]) => {
          const val = typeof v === 'string' ? v : JSON.stringify(v);
          return `${k}: ${val.length > 80 ? val.slice(0, 80) + '...' : val}`;
        })
        .join(', ')
    : String(entry.input);

  return (
    <div className="my-2 border border-zinc-700 rounded-lg overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
      >
        <span className="text-zinc-500">{expanded ? '▼' : '▶'}</span>
        <span className="font-mono text-amber-400">{entry.tool}</span>
        <span className="text-zinc-500 truncate flex-1">{inputSummary}</span>
      </button>
      {expanded && (
        <div className="px-3 py-2 space-y-2 bg-zinc-900/50">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Input</div>
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(entry.input, null, 2)}
            </pre>
          </div>
          {entry.output && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Output</div>
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                {entry.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
