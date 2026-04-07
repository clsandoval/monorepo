/**
 * Lockstep synchronization manager for networked play.
 * Collects local commands, sends them with input delay, and
 * feeds confirmed turns into the WASM simulation.
 */

import type { PlayerCommands } from './protocol.js';
import { NetClient } from './client.js';
import { tick as wasmTick, getStateChecksum } from '../wasm/bridge.js';

/** Commands are scheduled INPUT_DELAY_TICKS ahead of the current tick. */
export const INPUT_DELAY_TICKS = 3;

/** Checksums are sent every CHECKSUM_INTERVAL ticks. */
const CHECKSUM_INTERVAL = 30;

export class LockstepManager {
  private localTick = 0;
  private client: NetClient;

  /** Queued local commands indexed by the target tick they should execute on. */
  private localQueue: Map<number, string[]> = new Map();

  /** Confirmed turns received from the server, indexed by tick. */
  private confirmedTurns: Map<number, PlayerCommands[]> = new Map();

  /** Whether a desync has been detected. */
  desyncDetected = false;
  desyncTick = 0;

  constructor(client: NetClient) {
    this.client = client;
  }

  /**
   * Queue local commands. They will be sent targeting `localTick + INPUT_DELAY_TICKS`.
   */
  queueCommands(commands: string[]): void {
    const targetTick = this.localTick + INPUT_DELAY_TICKS;
    const existing = this.localQueue.get(targetTick) ?? [];
    existing.push(...commands);
    this.localQueue.set(targetTick, existing);
  }

  /**
   * Send the current tick's commands to the server.
   * Called each frame in the networked game loop.
   */
  sendTick(): void {
    const targetTick = this.localTick + INPUT_DELAY_TICKS;
    const commands = this.localQueue.get(targetTick) ?? [];
    const commandsJson = JSON.stringify(commands);

    // Include checksum every CHECKSUM_INTERVAL ticks
    let checksum: string | null = null;
    if (targetTick > 0 && targetTick % CHECKSUM_INTERVAL === 0) {
      checksum = getStateChecksum();
    }

    this.client.sendCommands(targetTick, commandsJson, checksum);

    // Clear sent commands
    this.localQueue.delete(targetTick);
  }

  /**
   * Store a confirmed turn received from the server.
   */
  receiveTurn(tick: number, commands: PlayerCommands[]): void {
    this.confirmedTurns.set(tick, commands);
  }

  /**
   * Try to advance the simulation by one tick.
   * Returns true if the tick was executed, false if we're waiting for server confirmation.
   */
  tryAdvance(): boolean {
    const turn = this.confirmedTurns.get(this.localTick);
    if (!turn) {
      return false; // Waiting for server
    }

    // Merge all players' commands into a single JSON array
    const allCommands: unknown[] = [];
    for (const pc of turn) {
      try {
        const parsed = JSON.parse(pc.commands_json);
        if (Array.isArray(parsed)) {
          allCommands.push(...parsed);
        }
      } catch {
        // Skip malformed commands
      }
    }

    const commandsJson = allCommands.length > 0 ? JSON.stringify(allCommands) : '';
    wasmTick(commandsJson);

    // Cleanup
    this.confirmedTurns.delete(this.localTick);
    this.localTick++;

    return true;
  }

  /**
   * Mark desync detected at a given tick.
   */
  onDesync(tick: number): void {
    this.desyncDetected = true;
    this.desyncTick = tick;
    console.error(`[Lockstep] DESYNC detected at tick ${tick}`);
  }

  get currentTick(): number {
    return this.localTick;
  }
}
