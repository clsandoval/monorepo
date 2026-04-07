/**
 * Iron Tide — main entry point.
 * Boot sequence: init WASM -> show lobby -> on start: init renderer, input, HUD, debug -> game loop.
 */

import { initWasm, initGame, tick, getUnitCount, getMapSize, getRenderData } from './wasm/bridge.js';
import { Renderer } from './renderer/index.js';
import { createClientState } from './game/state.js';
import { InputManager } from './input/index.js';
import { Lobby } from './ui/lobby.js';
import { HUD } from './ui/hud.js';
import { Minimap } from './ui/minimap.js';
import { CommandCard } from './ui/command-card.js';
import { DebugManager } from './debug.js';
import { GameCommand } from './game/commands.js';
import { NetClient } from './net/client.js';
import { LockstepManager } from './net/lockstep.js';
import type { ServerMessage } from './net/protocol.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'ws://localhost:8090';

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

// Networking
let netClient: NetClient | null = null;
let lockstep: LockstepManager | null = null;
let isNetworked = false;
let myPlayerId = 0;

const lobby = new Lobby();
const clientState = createClientState(0);

async function boot() {
  try {
    lobby.setStatus('Loading WASM engine...');
    await initWasm();

    lobby.setStatus('Ready');

    lobby.onStart(startLocalGame);
    lobby.onCreateRoom(handleCreateRoom);
    lobby.onJoinRoom(handleJoinRoom);
  } catch (err) {
    console.error('[IronTide] Boot failed:', err);
    lobby.setStatus(`Engine failed: ${err}`);
  }
}

async function startLocalGame() {
  try {
    lobby.setStatus('Initializing game...');

    initGame(42, 100, 2);

    const units = getUnitCount();
    const mapSize = getMapSize();
    console.log(`[IronTide] Game initialized — ${units} units, ${mapSize}x${mapSize} map`);

    await initRendererAndUI();

    running = true;
    isNetworked = false;
    requestAnimationFrame(localGameLoop);
  } catch (err) {
    console.error('[IronTide] Start failed:', err);
    lobby.setStatus(`Start failed: ${err}`);
  }
}

async function startNetworkedGame(seed: number, mapSeed: number, playerCount: number) {
  try {
    lobby.setStatus('Initializing networked game...');

    initGame(seed, mapSeed, playerCount);

    const units = getUnitCount();
    const mapSize = getMapSize();
    console.log(`[IronTide] Networked game initialized — ${units} units, ${mapSize}x${mapSize} map, player ${myPlayerId}`);

    // Update client state with our player ID
    clientState.playerId = myPlayerId;

    await initRendererAndUI();

    running = true;
    isNetworked = true;
    requestAnimationFrame(networkedGameLoop);
  } catch (err) {
    console.error('[IronTide] Networked start failed:', err);
    lobby.setStatus(`Start failed: ${err}`);
  }
}

async function initRendererAndUI() {
  // Try WebGPU renderer — if it fails, run headless (debug API only)
  try {
    lobby.setStatus('Initializing WebGPU renderer...');
    renderer = new Renderer();
    await renderer.init(canvas);
    renderer.camera.centerOn(10, 10);

    inputManager = new InputManager(clientState);
    inputManager.attach(canvas, renderer.camera);

    hud = new HUD();
    minimap = new Minimap(renderer.camera);
    minimap.init();
    commandCard = new CommandCard();
  } catch (err) {
    console.warn('[IronTide] WebGPU not available, running headless (debug API only):', err);
    renderer = null;
  }

  // Debug API always initializes — uses a dummy camera if no renderer
  const cam = renderer?.camera ?? new (await import('./renderer/camera.js')).Camera();
  if (!renderer) cam.centerOn(10, 10);

  const tickFn = (commandsJson?: string) => {
    const t0 = performance.now();
    tick(commandsJson ?? '');
    debugManager!.tickTimes.push(performance.now() - t0);
  };
  debugManager = new DebugManager(cam, clientState, tickFn);
  debugManager.install();

  lobby.hide();
  hudEl.classList.remove('hidden');
}

// ===== Networking handlers =====

async function handleCreateRoom() {
  try {
    lobby.setStatus('Connecting to server...');
    netClient = new NetClient();
    lockstep = new LockstepManager(netClient);

    await netClient.connect(SERVER_URL);

    netClient.onMessage(handleServerMessage);
    netClient.createRoom();
  } catch (err) {
    lobby.setStatus(`Connection failed: ${err}`);
  }
}

async function handleJoinRoom(code: string) {
  try {
    lobby.showJoining();
    lobby.setStatus('Connecting to server...');
    netClient = new NetClient();
    lockstep = new LockstepManager(netClient);

    await netClient.connect(SERVER_URL);

    netClient.onMessage(handleServerMessage);
    netClient.joinRoom(code);
  } catch (err) {
    lobby.setStatus(`Connection failed: ${err}`);
  }
}

function handleServerMessage(msg: ServerMessage): void {
  switch (msg.type) {
    case 'RoomCreated':
      myPlayerId = msg.player_id;
      lobby.showRoomCode(msg.room_code);
      lobby.setStatus('Room created. Waiting for opponent...');
      break;

    case 'RoomJoined':
      myPlayerId = msg.player_id;
      lobby.setStatus('Joined room. Waiting for game to start...');
      break;

    case 'GameStart':
      console.log(`[IronTide] GameStart — seed=${msg.seed}, mapSeed=${msg.map_seed}, players=${msg.player_count}`);
      startNetworkedGame(msg.seed, msg.map_seed, msg.player_count);
      break;

    case 'TurnCommands':
      lockstep?.receiveTurn(msg.tick, msg.commands);
      break;

    case 'DesyncDetected':
      lockstep?.onDesync(msg.tick);
      console.error(`[IronTide] DESYNC at tick ${msg.tick}!`);
      break;

    case 'PlayerDisconnected':
      console.warn(`[IronTide] Player ${msg.player_id} disconnected`);
      // TODO: show disconnect UI
      break;

    case 'Error':
      console.error(`[IronTide] Server error: ${msg.message}`);
      lobby.setStatus(`Error: ${msg.message}`);
      break;
  }
}

// ===== Game loops =====

function localGameLoop() {
  if (!running || !debugManager) return;
  const frameStart = performance.now();

  if (debugManager.tickMode === 'realtime') {
    const commands = inputManager?.flushCommands() ?? [];
    const cardCmds = commandCard?.flushCommands() ?? [];
    const allCmds: GameCommand[] = [...commands, ...cardCmds];

    const commandsJson = allCmds.length > 0 ? JSON.stringify(allCmds) : '';

    const t0 = performance.now();
    tick(commandsJson);
    debugManager.tickTimes.push(performance.now() - t0);
  }

  if (inputManager && renderer) {
    inputManager.update(renderer.camera);
    renderer.renderFrame(clientState.playerId);
  }

  frameCount++;
  if (frameCount % 5 === 0) {
    hud?.update(clientState);
    const renderData = getRenderData(clientState.playerId);
    minimap?.update(renderData);
    commandCard?.update(clientState, renderData);
  }

  debugManager.frameTimes.push(performance.now() - frameStart);
  requestAnimationFrame(localGameLoop);
}

function networkedGameLoop() {
  if (!running || !renderer || !inputManager || !debugManager || !lockstep) return;
  const frameStart = performance.now();

  // Collect local commands and queue them
  if (debugManager.tickMode === 'realtime') {
    const commands = inputManager.flushCommands();
    const cardCmds = commandCard?.flushCommands() ?? [];
    const allCmds: GameCommand[] = [...commands, ...cardCmds];

    if (allCmds.length > 0) {
      lockstep.queueCommands(allCmds.map(c => JSON.stringify(c)));
    }

    // Send our commands for the current tick
    lockstep.sendTick();

    // Try to advance as many confirmed ticks as possible
    while (lockstep.tryAdvance()) {
      // Tick advanced
    }
  }

  inputManager.update(renderer.camera);
  renderer.renderFrame(clientState.playerId);

  frameCount++;
  if (frameCount % 5 === 0) {
    hud?.update(clientState);
    const renderData = getRenderData(clientState.playerId);
    minimap?.update(renderData);
    commandCard?.update(clientState, renderData);
  }

  debugManager.frameTimes.push(performance.now() - frameStart);
  requestAnimationFrame(networkedGameLoop);
}

boot();
