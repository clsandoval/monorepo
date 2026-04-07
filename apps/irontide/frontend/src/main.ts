import { initWasm, initGame, getUnitCount, getMapSize } from './wasm/bridge';

const statusEl = document.getElementById('lobby-status')!;

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
  } catch (err) {
    console.error('[IronTide] Boot failed:', err);
    statusEl.textContent = `Engine failed: ${err}`;
  }
}

boot();
