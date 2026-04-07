/**
 * Minimap — simplified terrain + unit dots on a 200x200 canvas.
 */

import { Camera } from '../renderer/camera.js';
import { RenderUnit, getTerrainData, getMapSize } from '../wasm/bridge.js';

/** Terrain colors by tile type index */
const TILE_COLORS: string[] = [
  '#4d9933', // 0: grass
  '#3359a6', // 1: water
  '#736b66', // 2: rock
  '#bf9933', // 3: ore
];

const TEAM_DOT_COLORS = ['#3388ee', '#ee3333'];

export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private terrainData: Uint8Array | null = null;
  private mapSize = 0;
  private scale = 1; // pixels per tile on minimap
  private skip = 1;  // tile skip for rendering

  constructor(camera: Camera) {
    this.canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.camera = camera;

    // Click to jump camera
    this.canvas.addEventListener('click', (e) => this.onClick(e));
  }

  init(): void {
    this.mapSize = getMapSize();
    this.terrainData = getTerrainData();
    // 2px per tile with skip, targeting 200px canvas
    this.skip = Math.max(1, Math.floor(this.mapSize / 100));
    this.scale = this.canvas.width / this.mapSize;
  }

  update(renderData: RenderUnit[]): void {
    if (!this.terrainData) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    // Draw terrain (simplified — skip tiles for performance)
    const s = this.scale;
    const skip = this.skip;
    for (let ty = 0; ty < this.mapSize; ty += skip) {
      for (let tx = 0; tx < this.mapSize; tx += skip) {
        const idx = ty * this.mapSize + tx;
        const tileType = this.terrainData[idx];
        ctx.fillStyle = TILE_COLORS[tileType] ?? TILE_COLORS[0];
        ctx.fillRect(tx * s, ty * s, Math.max(skip * s, 1), Math.max(skip * s, 1));
      }
    }

    // Draw unit dots
    for (const unit of renderData) {
      ctx.fillStyle = TEAM_DOT_COLORS[unit.t] ?? '#ffffff';
      const px = unit.x * s;
      const py = unit.y * s;
      const dotSize = unit.s >= 100 ? 4 : 2; // buildings bigger
      ctx.fillRect(px - dotSize / 2, py - dotSize / 2, dotSize, dotSize);
    }

    // Draw camera viewport rectangle
    const tl = this.camera.screenToTile(0, 0);
    const br = this.camera.screenToTile(this.camera.canvasW, this.camera.canvasH);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      tl.tileX * s,
      tl.tileY * s,
      (br.tileX - tl.tileX) * s,
      (br.tileY - tl.tileY) * s,
    );
  }

  private onClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Convert minimap pixel to tile
    const cssScale = this.canvas.width / rect.width;
    const tileX = (mx * cssScale) / this.scale;
    const tileY = (my * cssScale) / this.scale;
    this.camera.centerOn(tileX, tileY);
  }
}
