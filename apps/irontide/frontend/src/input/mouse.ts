/**
 * Mouse input — selection (click/drag), right-click commands, wheel zoom.
 */

import { Camera } from '../renderer/camera.js';
import { RenderUnit } from '../wasm/bridge.js';

export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active: boolean;
}

export interface MouseClick {
  screenX: number;
  screenY: number;
  button: 'left' | 'right';
  tileX: number;
  tileY: number;
}

export class MouseInput {
  /** Pending clicks consumed by InputManager each frame */
  pendingClicks: MouseClick[] = [];
  selectionRect: SelectionRect = { startX: 0, startY: 0, endX: 0, endY: 0, active: false };

  private canvas: HTMLCanvasElement | null = null;
  private camera: Camera | null = null;
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private readonly DRAG_THRESHOLD = 5;

  attach(canvas: HTMLCanvasElement, camera: Camera): void {
    this.canvas = canvas;
    this.camera = camera;

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private getCanvasPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
    };
  }

  private onMouseDown(e: MouseEvent): void {
    const pos = this.getCanvasPos(e);
    if (e.button === 0) {
      // Left button — start potential drag
      this.dragStartX = pos.x;
      this.dragStartY = pos.y;
      this.dragging = false;
      this.selectionRect.startX = pos.x;
      this.selectionRect.startY = pos.y;
      this.selectionRect.endX = pos.x;
      this.selectionRect.endY = pos.y;
      this.selectionRect.active = false;
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (e.buttons & 1) {
      const pos = this.getCanvasPos(e);
      const dx = Math.abs(pos.x - this.dragStartX);
      const dy = Math.abs(pos.y - this.dragStartY);
      if (dx > this.DRAG_THRESHOLD || dy > this.DRAG_THRESHOLD) {
        this.dragging = true;
        this.selectionRect.endX = pos.x;
        this.selectionRect.endY = pos.y;
        this.selectionRect.active = true;
      }
    }
  }

  private onMouseUp(e: MouseEvent): void {
    const pos = this.getCanvasPos(e);
    const tile = this.camera!.screenToTile(pos.x, pos.y);

    if (e.button === 0) {
      if (this.dragging) {
        // Box select complete — rect is read by InputManager
        this.selectionRect.endX = pos.x;
        this.selectionRect.endY = pos.y;
        // InputManager will read selectionRect.active and process it
      } else {
        // Single left click
        this.pendingClicks.push({
          screenX: pos.x,
          screenY: pos.y,
          button: 'left',
          tileX: tile.tileX,
          tileY: tile.tileY,
        });
      }
    } else if (e.button === 2) {
      // Right click
      this.pendingClicks.push({
        screenX: pos.x,
        screenY: pos.y,
        button: 'right',
        tileX: tile.tileX,
        tileY: tile.tileY,
      });
    }
    this.dragging = false;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.camera!.zoomAt(factor);
  }

  /** Find the nearest friendly entity within a threshold (in tile distance). */
  findNearestEntity(
    tileX: number,
    tileY: number,
    renderData: RenderUnit[],
    friendlyTeam: number,
    maxDist = 2,
  ): number | null {
    let bestId: number | null = null;
    let bestDist = maxDist;
    for (const unit of renderData) {
      if (unit.t !== friendlyTeam) continue;
      const dx = unit.x - tileX;
      const dy = unit.y - tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = unit.id;
      }
    }
    return bestId;
  }

  /** Find all friendly entities within a screen-space rectangle. */
  findEntitiesInRect(
    camera: Camera,
    renderData: RenderUnit[],
    friendlyTeam: number,
    rect: SelectionRect,
  ): number[] {
    const minX = Math.min(rect.startX, rect.endX);
    const maxX = Math.max(rect.startX, rect.endX);
    const minY = Math.min(rect.startY, rect.endY);
    const maxY = Math.max(rect.startY, rect.endY);

    const ids: number[] = [];
    for (const unit of renderData) {
      if (unit.t !== friendlyTeam) continue;
      const screen = camera.tileToScreen(unit.x, unit.y);
      if (screen.x >= minX && screen.x <= maxX && screen.y >= minY && screen.y <= maxY) {
        ids.push(unit.id);
      }
    }
    return ids;
  }
}
