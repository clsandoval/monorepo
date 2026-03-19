import { useState } from 'react';
import { FileTreeNode } from './FileTreeNode';
import { FilePreview } from './FilePreview';
import type { FileTreeNode as FileTreeNodeType } from '../types';

interface FileExplorerProps {
  tree: FileTreeNodeType[];
  loading: boolean;
  onRefresh: () => void;
}

export function FileExplorer({ tree, loading, onRefresh }: FileExplorerProps) {
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-col h-full bg-surface-0 border-r border-default">
        <div className="flex items-center justify-between px-3 py-2 border-b border-default">
          <span className="text-xs font-display font-semibold text-text-muted uppercase tracking-wider">Files</span>
          <button onClick={onRefresh} className="btn-icon" title="Refresh" disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {tree.length === 0 && !loading && (
            <div className="text-text-muted text-xs px-3 py-4 text-center">No files in workspace</div>
          )}
          {tree.map((node) => (
            <FileTreeNode key={node.path || node.name} node={node} depth={0} onFileClick={setPreviewPath} />
          ))}
        </div>
      </div>
      {previewPath && <FilePreview filePath={previewPath} onClose={() => setPreviewPath(null)} />}
    </>
  );
}
