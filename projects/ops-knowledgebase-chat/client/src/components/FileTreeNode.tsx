import { useState } from 'react';
import type { FileTreeNode as FileTreeNodeType } from '../types';

interface FileTreeNodeProps {
  node: FileTreeNodeType;
  depth: number;
  onFileClick: (path: string) => void;
}

export function FileTreeNode({ node, depth, onFileClick }: FileTreeNodeProps) {
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
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 py-1 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left font-mono text-xs"
          style={{ paddingLeft: depth * 16 + 8 }}
        >
          <span className="text-text-muted w-3 text-center">{expanded ? '▼' : '▶'}</span>
          <span>{node.name}/</span>
        </button>
        {expanded && node.children?.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileClick(node.path)}
      className="w-full flex items-center gap-1 py-1 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left font-mono text-xs"
      style={{ paddingLeft: depth * 16 + 20 }}
    >
      <span>{node.name}</span>
    </button>
  );
}
