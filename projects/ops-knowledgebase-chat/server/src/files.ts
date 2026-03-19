import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type { FileTreeNode } from './protocol.js';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const MAX_FILES = 1000;
const MAX_DEPTH = 10;

function buildTree(dirPath: string, relativeTo: string, depth: number, fileCount: { count: number }): FileTreeNode[] {
  if (depth > MAX_DEPTH || fileCount.count >= MAX_FILES) {
    return [];
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  // Sort: directories first, then alphabetical
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    if (fileCount.count >= MAX_FILES) {
      nodes.push({ name: '...', path: '', type: 'file', truncated: true });
      break;
    }

    // Skip hidden dirs except don't skip all dotfiles
    if (entry.name === '.sessions' || entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(relativeTo, fullPath);

    if (entry.isDirectory()) {
      const children = buildTree(fullPath, relativeTo, depth + 1, fileCount);
      nodes.push({ name: entry.name, path: relPath, type: 'directory', children });
    } else {
      fileCount.count++;
      let size: number | undefined;
      try {
        size = fs.statSync(fullPath).size;
      } catch { /* ignore */ }
      nodes.push({ name: entry.name, path: relPath, type: 'file', size });
    }
  }

  return nodes;
}

export const filesRouter = Router();

// GET /api/files — recursive directory tree
filesRouter.get('/api/files', (_req, res) => {
  const fileCount = { count: 0 };
  const tree = buildTree(WORKSPACE_DIR, WORKSPACE_DIR, 0, fileCount);
  res.json(tree);
});

// GET /api/files/* — raw file content (Express 5 named wildcard)
filesRouter.get('/api/files/{*filePath}', (req, res) => {
  const rawParam = (req.params as Record<string, string | string[]>).filePath;
  const filePath = Array.isArray(rawParam) ? rawParam.join('/') : (rawParam || '');

  // Path traversal protection
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    res.status(400).json({ error: 'Invalid path' });
    return;
  }

  const fullPath = path.join(WORKSPACE_DIR, filePath);

  // Ensure resolved path is within workspace
  if (!fullPath.startsWith(WORKSPACE_DIR)) {
    res.status(400).json({ error: 'Path outside workspace' });
    return;
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const filename = path.basename(fullPath);
  res.set('Content-Disposition', `attachment; filename="${filename}"`);
  res.type('text/plain').send(content);
});

// DELETE /api/files/* — delete a file from workspace
filesRouter.delete('/api/files/{*filePath}', (req, res) => {
  const rawParam = (req.params as Record<string, string | string[]>).filePath;
  const filePath = Array.isArray(rawParam) ? rawParam.join('/') : (rawParam || '');

  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    res.status(400).json({ error: 'Invalid path' });
    return;
  }

  const fullPath = path.join(WORKSPACE_DIR, filePath);

  if (!fullPath.startsWith(WORKSPACE_DIR)) {
    res.status(400).json({ error: 'Path outside workspace' });
    return;
  }

  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    fs.rmSync(fullPath, { recursive: true });
  } else {
    fs.unlinkSync(fullPath);
  }

  res.json({ deleted: filePath });
});
