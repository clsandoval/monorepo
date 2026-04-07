import { initWasm, initGame, tick, getUnitCount, getMapSize } from './wasm/bridge';
import { Renderer } from './renderer/index';

const statusEl = document.getElementById('lobby-status')!;
const lobbyEl = document.getElementById('lobby')!;
const hudEl = document.getElementById('hud')!;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

let renderer: Renderer | null = null;
let running = false;

async function boot() {
  try {
    statusEl.textContent = 'Loading WASM engine...';
    await initWasm();

    statusEl.textContent = 'Initializing game...';
    initGame(42, 100, 2);

    const units = getUnitCount();
    const mapSize = getMapSize();
    console.log(`[IronTide] Game initialized — ${units} units, ${mapSize}x${mapSize} map`);

    statusEl.textContent = `Engine ready — ${units} units, ${mapSize}x${mapSize} map`;

    // Init WebGPU renderer
    statusEl.textContent = 'Initializing WebGPU renderer...';
    renderer = new Renderer();
    await renderer.init(canvas);

    // Center camera on player 0's approximate start location
    renderer.camera.centerOn(10, 10);

    statusEl.textContent = 'Ready — click Start to play';

    const startBtn = document.getElementById('btn-start-local');
    startBtn?.addEventListener('click', startGame);
  } catch (err) {
    console.error('[IronTide] Boot failed:', err);
    statusEl.textContent = `Engine failed: ${err}`;
  }
}

function startGame() {
  // Hide lobby, show HUD
  lobbyEl.classList.add('hidden');
  hudEl.classList.remove('hidden');

  running = true;
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!running || !renderer) return;

  // Tick the simulation (local mode, no commands for now)
  tick();

  // Render the frame
  renderer.renderFrame(0);

  requestAnimationFrame(gameLoop);
}

boot();
