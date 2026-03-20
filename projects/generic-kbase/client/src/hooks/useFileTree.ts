import { useState, useEffect, useCallback } from 'react';
import type { FileTreeNode } from '../types';

export function useFileTree() {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setTree(data);
    } catch {
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Flatten tree to list of file paths (for autocomplete)
  const flatFiles = flattenTree(tree);

  return { tree, flatFiles, loading, refresh };
}

function flattenTree(nodes: FileTreeNode[]): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push(node.path);
    } else if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
