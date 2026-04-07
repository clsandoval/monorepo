/**
 * Isometric camera for SC2-style projection (~60 degree angle).
 * TILE_WIDTH=64, TILE_HEIGHT=32 gives the classic 2:1 diamond.
 */

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export class Camera {
  /** Camera offset in screen pixels (top-left origin) */
  offsetX = 0;
  offsetY = 0;
  zoom = 1;
  canvasW = 0;
  canvasH = 0;

  setCanvasSize(w: number, h: number): void {
    this.canvasW = w;
    this.canvasH = h;
  }

  /** Convert tile coordinates to screen pixels. */
  tileToScreen(tileX: number, tileY: number): { x: number; y: number } {
    const isoX = (tileX - tileY) * (TILE_WIDTH / 2);
    const isoY = (tileX + tileY) * (TILE_HEIGHT / 2);
    return {
      x: isoX * this.zoom + this.offsetX,
      y: isoY * this.zoom + this.offsetY,
    };
  }

  /** Inverse of tileToScreen — convert screen pixels to fractional tile coords. */
  screenToTile(sx: number, sy: number): { tileX: number; tileY: number } {
    const wx = (sx - this.offsetX) / this.zoom;
    const wy = (sy - this.offsetY) / this.zoom;
    const tileX = (wx / (TILE_WIDTH / 2) + wy / (TILE_HEIGHT / 2)) / 2;
    const tileY = (wy / (TILE_HEIGHT / 2) - wx / (TILE_WIDTH / 2)) / 2;
    return { tileX, tileY };
  }

  /** Pan the camera by a pixel delta. */
  pan(dx: number, dy: number): void {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  /** Zoom, clamped between 0.25 and 4. */
  zoomAt(factor: number): void {
    this.zoom = Math.min(4, Math.max(0.25, this.zoom * factor));
  }

  /** Center camera on a tile. */
  centerOn(tileX: number, tileY: number): void {
    const isoX = (tileX - tileY) * (TILE_WIDTH / 2);
    const isoY = (tileX + tileY) * (TILE_HEIGHT / 2);
    this.offsetX = this.canvasW / 2 - isoX * this.zoom;
    this.offsetY = this.canvasH / 2 - isoY * this.zoom;
  }

  /** Return min/max tile coordinates currently visible on screen (for frustum culling). */
  getVisibleBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    // Sample corners of the viewport, add padding
    const pad = 2;
    const tl = this.screenToTile(0, 0);
    const tr = this.screenToTile(this.canvasW, 0);
    const bl = this.screenToTile(0, this.canvasH);
    const br = this.screenToTile(this.canvasW, this.canvasH);

    const allX = [tl.tileX, tr.tileX, bl.tileX, br.tileX];
    const allY = [tl.tileY, tr.tileY, bl.tileY, br.tileY];

    return {
      minX: Math.floor(Math.min(...allX)) - pad,
      minY: Math.floor(Math.min(...allY)) - pad,
      maxX: Math.ceil(Math.max(...allX)) + pad,
      maxY: Math.ceil(Math.max(...allY)) + pad,
    };
  }
}
