/**
 * HUD — resource display and selection info.
 */

import { getResources } from '../wasm/bridge.js';
import { ClientState } from '../game/state.js';

export class HUD {
  private oreEl: HTMLElement;
  private supplyEl: HTMLElement;
  private selectionEl: HTMLElement;

  constructor() {
    this.oreEl = document.getElementById('hud-ore')!;
    this.supplyEl = document.getElementById('hud-supply')!;
    this.selectionEl = document.getElementById('selection-info')!;
  }

  update(state: ClientState): void {
    const ore = getResources(state.playerId);
    this.oreEl.textContent = `Ore: ${ore}`;

    // Supply — show selected count for now (full supply tracking would need WASM support)
    const selCount = state.selectedEntityIds.length;
    this.supplyEl.textContent = `Selected: ${selCount}`;

    // Selection info
    if (selCount === 0) {
      this.selectionEl.textContent = '';
    } else if (selCount === 1) {
      this.selectionEl.textContent = `Entity #${state.selectedEntityIds[0]}`;
    } else {
      this.selectionEl.textContent = `${selCount} units selected`;
    }
  }
}
