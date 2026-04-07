/**
 * Iron Tide — main entry point.
 * Boot sequence: init WASM -> show lobby -> on start: init renderer, input, HUD, debug -> game loop.
 */

import { initWasm, initGame, tick, getUnitCount, getMapSize, getRenderData } from './wasm/bridge';
import { Renderer } from './renderer/index';
import { createClientState } from './game/state';
import { InputManager } from './input/index';
import { Lobby } from './ui/lobby';
import { HUD } from './ui/hud';
import { Minimap } from './ui/minimap';
import { CommandCard } from './ui/command-card';
import { DebugManager } from './debug';
import { GameCommand } from './game/commands';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const hudEl = document.getElementById('hud')!;

let renderer: Renderer | null = null;
let inputManager: InputManager | null = null;
let hud: HUD | null = null;
let minimap: Minimap | null = null;
let commandCard: CommandCard | null = null;
let debugManager: DebugManager | null = null;
let running = false;
let frameCount = 0;

const lobby = new Lobby();
const clientState = createClientState(0);

async function boot() {
  try {
    lobby.setStatus('Loading WASM engine...');
    await initWasm();

    lobby.setStatus('Ready');

    lobby.onStart(startGame);
  } catch (err) {
    console.error('[IronTide] Boot failed:', err);
    lobby.setStatus(`Engine failed: ${err}`);
  }
}

async function startGame() {
  try {
    lobby.setStatus('Initializing game...');

    initGame(42, 100, 2);

    const units = getUnitCount();
    const mapSize = getMapSize();
    console.log(`[IronTide] Game initialized — ${units} units, ${mapSize}x${mapSize} map`);

    // Init WebGPU renderer
    lobby.setStatus('Initializing WebGPU renderer...');
    renderer = new Renderer();
    await renderer.init(canvas);

    // Center camera on player 0's approximate start location
    renderer.camera.centerOn(10, 10);

    // Init input manager
    inputManager = new InputManager(clientState);
    inputManager.attach(canvas, renderer.camera);

    // Init HUD
    hud = new HUD();
    minimap = new Minimap(renderer.camera);
    minimap.init();
    commandCard = new CommandCard();

    // Init debug API
    const tickFn = (commandsJson?: string) => {
      const t0 = performance.now();
      tick(commandsJson ?? '');
      debugManager!.tickTimes.push(performance.now() - t0);
    };
    debugManager = new DebugManager(renderer.camera, clientState, tickFn);
    debugManager.install();

    // Hide lobby, show HUD
    lobby.hide();
    hudEl.classList.remove('hidden');

    running = true;
    requestAnimationFrame(gameLoop);
  } catch (err) {
    console.error('[IronTide] Start failed:', err);
    lobby.setStatus(`Start failed: ${err}`);
  }
}

function gameLoop() {
  if (!running || !renderer || !inputManager || !debugManager) return;
  const frameStart = performance.now();

  // Tick the simulation (unless in manual mode)
  if (debugManager.tickMode === 'realtime') {
    const commands = inputManager.flushCommands();
    // Also flush command card commands
    const cardCmds = commandCard?.flushCommands() ?? [];
    const allCmds: GameCommand[] = [...commands, ...cardCmds];

    const commandsJson = allCmds.length > 0 ? JSON.stringify(allCmds) : '';

    const t0 = performance.now();
    tick(commandsJson);
    debugManager.tickTimes.push(performance.now() - t0);
  }

  // Input manager update (camera pan, selection processing)
  inputManager.update(renderer.camera);

  // Render the frame
  renderer.renderFrame(clientState.playerId);

  // Update HUD every 5 frames
  frameCount++;
  if (frameCount % 5 === 0) {
    hud?.update(clientState);
    const renderData = getRenderData(clientState.playerId);
    minimap?.update(renderData);
    commandCard?.update(clientState, renderData);
  }

  debugManager.frameTimes.push(performance.now() - frameStart);
  requestAnimationFrame(gameLoop);
}

boot();
