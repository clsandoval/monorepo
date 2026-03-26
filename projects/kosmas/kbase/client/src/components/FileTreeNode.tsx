import { useState } from 'react';
import type { FileTreeNode as FileTreeNodeType } from '../types';

interface FileTreeNodeProps {
  node: FileTreeNodeType;
  depth: number;
  onFileClick: (path: string) => void;
  onFileDelete: (path: string) => void;
}

export function FileTreeNode({ node, depth, onFileClick, onFileDelete }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0);

  if (node.truncated) {
    return (
      <div className="text-text-muted text-xs py-1" style={{ paddingLeft: depth * 16 + 8 }}>
        ... (truncated)
      </div>
    );
  }

  if (node.type === 'directory') {
    return (
      <div>
        <div
          className="group w-full flex items-center gap-1 py-1 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left font-mono text-xs"
          style={{ paddingLeft: depth * 16 + 8 }}
        >
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 flex-1 text-left">
            <span className="text-text-muted w-3 text-center">{expanded ? '▼' : '▶'}</span>
            <span>{node.name}/</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onFileDelete(node.path); }}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-error transition-opacity p-0.5"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {expanded && node.children?.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} onFileDelete={onFileDelete} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="group w-full flex items-center gap-1 py-1 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors font-mono text-xs"
      style={{ paddingLeft: depth * 16 + 20 }}
    >
      <button onClick={() => onFileClick(node.path)} className="flex-1 text-left">
        {node.name}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onFileDelete(node.path); }}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-error transition-opacity p-0.5"
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
