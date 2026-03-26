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
    <div className={`my-2 bg-tool-bg border-l-2 ${expanded ? 'border-l-tool-border-active' : 'border-l-tool-border'} rounded-r-md font-mono text-sm text-text-secondary`}>
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:text-text-primary transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-text-muted">{expanded ? '▼' : '▶'}</span>
        <span className="font-medium text-text-primary">{entry.tool}</span>
        <span className="text-text-muted truncate flex-1">{inputSummary}</span>
      </div>
      {expanded && (
        <div className="px-4 py-3 border-t border-default">
          <div>
            <div className="text-xs text-text-muted mb-1">Input</div>
            <pre className="text-xs text-code-text whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(entry.input, null, 2)}
            </pre>
          </div>
          {entry.output && (
            <div className="mt-3 pt-3 border-t border-default">
              <div className="text-xs text-text-muted mb-1">Output</div>
              <pre className="text-xs text-code-text whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto">
                {entry.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
