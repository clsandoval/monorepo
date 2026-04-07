/**
 * Keyboard input tracker — WASD camera pan + hotkeys.
 */

import { Camera } from '../renderer/camera.js';

const PAN_SPEED = 8; // pixels per frame

export class KeyboardInput {
  private pressed = new Set<string>();

  attach(): void {
    window.addEventListener('keydown', (e) => {
      this.pressed.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.pressed.delete(e.key.toLowerCase());
    });
    // Clear on blur (alt-tab, etc.)
    window.addEventListener('blur', () => {
      this.pressed.clear();
    });
  }

  isPressed(key: string): boolean {
    return this.pressed.has(key.toLowerCase());
  }

  /** Apply WASD/arrow camera panning. */
  updateCamera(camera: Camera): void {
    let dx = 0;
    let dy = 0;
    if (this.pressed.has('w') || this.pressed.has('arrowup')) dy += PAN_SPEED;
    if (this.pressed.has('s') || this.pressed.has('arrowdown')) dy -= PAN_SPEED;
    if (this.pressed.has('a') || this.pressed.has('arrowleft')) dx += PAN_SPEED;
    if (this.pressed.has('d') || this.pressed.has('arrowright')) dx -= PAN_SPEED;
    if (dx !== 0 || dy !== 0) {
      camera.pan(dx, dy);
    }
  }
}
