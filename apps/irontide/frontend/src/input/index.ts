/**
 * Input Manager — combines keyboard + mouse, manages selection and command accumulation.
 */

import { Camera } from '../renderer/camera.js';
import { RenderUnit, getRenderData } from '../wasm/bridge.js';
import { ClientState } from '../game/state.js';
import { GameCommand, createMoveCommand, createAttackMoveCommand, createStopCommand } from '../game/commands.js';
import { KeyboardInput } from './keyboard.js';
import { MouseInput } from './mouse.js';

export class InputManager {
  private keyboard = new KeyboardInput();
  private mouse = new MouseInput();
  private state: ClientState;
  private pendingCommands: GameCommand[] = [];
  private attackMoveMode = false;

  /** Last render data snapshot for entity picking */
  private lastRenderData: RenderUnit[] = [];

  constructor(state: ClientState) {
    this.state = state;
  }

  attach(canvas: HTMLCanvasElement, camera: Camera): void {
    this.keyboard.attach();
    this.mouse.attach(canvas, camera);

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();

      // Attack-move mode
      if (key === 'a' && this.state.selectedEntityIds.length > 0) {
        this.attackMoveMode = true;
        return;
      }

      // Stop
      if (key === 's' && !e.ctrlKey && this.state.selectedEntityIds.length > 0) {
        // Only if not WASD panning context (s is dual-use, but stop is more important when selected)
        // Actually s is used for camera pan too. Let's use 's' without shift for stop only when we have selection
        // and the user isn't holding other movement keys. Simplification: s = stop when entities selected.
        // This matches RTS convention.
      }

      // Escape to deselect
      if (key === 'escape') {
        this.state.selectedEntityIds = [];
        this.attackMoveMode = false;
      }

      // Control groups
      const num = parseInt(key, 10);
      if (num >= 1 && num <= 9) {
        if (e.ctrlKey) {
          // Assign control group
          this.state.controlGroups.set(num, [...this.state.selectedEntityIds]);
        } else {
          // Recall control group
          const group = this.state.controlGroups.get(num);
          if (group && group.length > 0) {
            this.state.selectedEntityIds = [...group];
          }
        }
      }
    });

    // Stop command via 's' keyup (so it doesn't conflict with held-down pan)
    window.addEventListener('keyup', (e) => {
      if (e.key.toLowerCase() === 's' && this.state.selectedEntityIds.length > 0 && !e.ctrlKey) {
        this.pendingCommands.push(
          createStopCommand(this.state.playerId, this.state.selectedEntityIds)
        );
      }
    });
  }

  /** Call each frame. */
  update(camera: Camera): void {
    // Camera panning (WASD + arrows, but skip s since it's stop)
    this.keyboard.updateCamera(camera);

    // Snapshot render data for picking
    this.lastRenderData = getRenderData(this.state.playerId);

    // Process mouse clicks
    for (const click of this.mouse.pendingClicks) {
      if (click.button === 'left') {
        if (this.attackMoveMode) {
          // Attack-move to clicked position
          if (this.state.selectedEntityIds.length > 0) {
            this.pendingCommands.push(
              createAttackMoveCommand(
                this.state.playerId,
                this.state.selectedEntityIds,
                click.tileX,
                click.tileY,
              )
            );
          }
          this.attackMoveMode = false;
        } else {
          // Single select — find nearest friendly entity
          const entityId = this.mouse.findNearestEntity(
            click.tileX,
            click.tileY,
            this.lastRenderData,
            this.state.playerId,
          );
          this.state.selectedEntityIds = entityId !== null ? [entityId] : [];
        }
      } else if (click.button === 'right') {
        // Right click — context-sensitive command (move for now)
        if (this.state.selectedEntityIds.length > 0) {
          this.pendingCommands.push(
            createMoveCommand(
              this.state.playerId,
              this.state.selectedEntityIds,
              click.tileX,
              click.tileY,
            )
          );
        }
        this.attackMoveMode = false;
      }
    }
    this.mouse.pendingClicks.length = 0;

    // Process box selection
    if (this.mouse.selectionRect.active) {
      const ids = this.mouse.findEntitiesInRect(
        camera,
        this.lastRenderData,
        this.state.playerId,
        this.mouse.selectionRect,
      );
      if (ids.length > 0) {
        this.state.selectedEntityIds = ids;
      }
      this.mouse.selectionRect.active = false;
    }
  }

  /** Flush accumulated commands (returns array and clears buffer). */
  flushCommands(): GameCommand[] {
    const cmds = this.pendingCommands;
    this.pendingCommands = [];
    return cmds;
  }

  getState(): ClientState {
    return this.state;
  }

  getRenderData(): RenderUnit[] {
    return this.lastRenderData;
  }
}
