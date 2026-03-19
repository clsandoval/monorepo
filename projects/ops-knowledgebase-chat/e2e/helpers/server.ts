import { execSync, spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');
const SERVER_DIR = path.join(PROJECT_ROOT, 'server');
const CLIENT_DIR = path.join(PROJECT_ROOT, 'client');
const WORKSPACE_DIR = '/tmp/ops-kb-e2e-workspace';
const PORT = 8080;

let serverProcess: ChildProcess | null = null;
let starting: Promise<void> | null = null;

export async function startServer(): Promise<void> {
  // Deduplicate concurrent calls from parallel workers
  if (starting) return starting;
  starting = doStartServer();
  return starting;
}

async function doStartServer(): Promise<void> {
  // If server is already running, just wait for health
  try {
    const res = await fetch(`http://localhost:${PORT}/health`);
    if (res.ok) return;
  } catch {
    // not running, proceed with startup
  }

  fs.rmSync(WORKSPACE_DIR, { recursive: true, force: true });
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

  fs.writeFileSync(path.join(WORKSPACE_DIR, 'readme.txt'), 'This is a test knowledgebase.\nIt contains important documents for testing.\n');
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'notes.md'), '# Meeting Notes\n\n- Discussed Q1 priorities\n- Action item: review budget\n- Next meeting: March 25\n');
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'data.csv'), 'name,value\nalpha,100\nbeta,200\ngamma,300\n');

  execSync('npm run build', { cwd: SERVER_DIR, stdio: 'pipe' });
  execSync('npm run build', { cwd: CLIENT_DIR, stdio: 'pipe' });

  const publicDir = path.join(SERVER_DIR, 'public');
  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.cpSync(path.join(CLIENT_DIR, 'dist'), publicDir, { recursive: true });

  serverProcess = spawn('node', ['dist/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORKSPACE_DIR },
    stdio: 'pipe',
  });

  await waitForServer(`http://localhost:${PORT}/health`, 30_000);
}

export async function stopServer(): Promise<void> {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}
