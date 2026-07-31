/*
 * journey/serve.mjs — the build-and-preview lifecycle a live journey gate needs.
 *
 * A screenshot gate that runs against a stale bundle is worse than no gate: it
 * goes green on code that is not the code in the tree. So every run rebuilds
 * first, and the preview server is started and stopped by the runner rather than
 * assumed to be already up.
 *
 * The port is FIXED at 4173 with `--strictPort`. A port that silently moves when
 * 4173 is busy would let a run screenshot somebody else's server; strict-port
 * turns that into a loud startup failure instead.
 *
 * Neither export writes any file other than what `npm run build` itself emits
 * into `dist/`, which `frontend/.gitignore` already excludes.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');

/** The fixed preview port and origin. */
export const PREVIEW_PORT = 4173;
export const PREVIEW_ORIGIN = `http://127.0.0.1:${PREVIEW_PORT}`;

/** How long startPreview waits for the server to answer, in milliseconds. */
const PREVIEW_TIMEOUT_MS = 30000;
const PREVIEW_POLL_MS = 250;

/**
 * A condition under which the run could not START, as distinct from a step that
 * ran and failed. `run.mjs` turns this into exit code 2.
 */
export class JourneyCannotRun extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'JourneyCannotRun';
    this.reason = reason;
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Build the application. Inherits stdio so a build failure is legible in the
 * gate log rather than swallowed into a variable nobody prints.
 *
 * @returns {Promise<void>}
 * @throws {JourneyCannotRun} when `npm run build` exits nonzero
 */
export async function buildApp() {
  const code = await new Promise((resolve) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd: FRONTEND_ROOT,
      stdio: 'inherit',
    });
    child.on('error', () => resolve(-1));
    child.on('close', (exitCode) => resolve(exitCode === null ? -1 : exitCode));
  });

  if (code !== 0) {
    throw new JourneyCannotRun(`npm run build exited ${code}`);
  }
}

/**
 * Start `vite preview` on the fixed port and wait until it answers.
 *
 * @returns {Promise<{origin: string, stop: () => Promise<void>}>}
 * @throws {JourneyCannotRun} when the server never answers within the timeout
 */
export async function startPreview() {
  const child = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'],
    {
      cwd: FRONTEND_ROOT,
      // A new process group, so stop() can kill vite AND every esbuild child it
      // spawned. Killing only the parent leaves the port held.
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let exited = false;
  let stderrTail = '';
  child.on('close', () => {
    exited = true;
  });
  child.stderr.on('data', (chunk) => {
    stderrTail = `${stderrTail}${chunk}`.slice(-2000);
  });
  // Drain stdout so a full pipe buffer can never block the server.
  child.stdout.on('data', () => {});

  const stop = async () => {
    if (exited) return;
    try {
      // Negative pid = the whole process group.
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      try {
        child.kill('SIGTERM');
      } catch {
        // Already gone.
      }
    }
    // Give the port a moment to be released before the caller reuses it.
    for (let i = 0; i < 40 && !exited; i += 1) {
      await sleep(50);
    }
    if (!exited) {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        // Already gone.
      }
      await sleep(100);
    }
  };

  const deadline = Date.now() + PREVIEW_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (exited) {
      throw new JourneyCannotRun(
        `vite preview exited before answering on ${PREVIEW_ORIGIN}: ${stderrTail.trim()}`,
      );
    }
    try {
      const res = await fetch(`${PREVIEW_ORIGIN}/`);
      if (res.status === 200) {
        // Drain the body so the socket closes cleanly.
        await res.arrayBuffer();
        return { origin: PREVIEW_ORIGIN, stop };
      }
    } catch {
      // Not up yet.
    }
    await sleep(PREVIEW_POLL_MS);
  }

  await stop();
  throw new JourneyCannotRun(
    `preview server did not answer on ${PREVIEW_ORIGIN} within ${PREVIEW_TIMEOUT_MS} ms`,
  );
}
