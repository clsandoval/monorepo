/**
 * Main WebGPU renderer — orchestrates terrain (and later sprite) rendering.
 */

import { Camera } from './camera';
import { TerrainRenderer } from './terrain';
import { SpriteRenderer } from './sprites';
import { getTerrainData, getFogData, getMapSize, getRenderData } from '../wasm/bridge';

export class Renderer {
  readonly camera = new Camera();

  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;
  private terrain!: TerrainRenderer;
  private sprites!: SpriteRenderer;

  /** Cached terrain data (map doesn't change at runtime). */
  private terrainData!: Uint8Array;
  private mapSize!: number;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    // Request adapter + device
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('WebGPU not supported — no adapter found');
    this.device = await adapter.requestDevice();

    // Configure canvas context
    this.context = canvas.getContext('webgpu') as GPUCanvasContext;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
    });

    // Size canvas to its CSS layout size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    this.camera.setCanvasSize(canvas.width, canvas.height);

    // Init sub-renderers
    this.terrain = new TerrainRenderer();
    await this.terrain.init(this.device, this.format);
    this.sprites = new SpriteRenderer();
    await this.sprites.init(this.device, this.format);

    // Cache terrain (it never changes)
    this.terrainData = getTerrainData();
    this.mapSize = getMapSize();
  }

  /**
   * Render a single frame.
   * @param viewerTeam — team index for fog-of-war (default 0)
   */
  renderFrame(viewerTeam = 0): void {
    const fogData = getFogData(viewerTeam);
    const { width, height } = { width: this.camera.canvasW, height: this.camera.canvasH };

    // Update terrain instances (frustum-culled)
    this.terrain.updateInstances(
      this.device,
      this.camera,
      this.terrainData,
      fogData,
      this.mapSize,
      width,
      height,
    );

    // Begin render pass
    const textureView = this.context.getCurrentTexture().createView();
    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.06, g: 0.06, b: 0.08, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    this.terrain.render(passEncoder);

    // Sprite pass — units and buildings
    const renderData = getRenderData(viewerTeam);
    this.sprites.updateInstances(this.device, this.camera, renderData, width, height);
    this.sprites.render(passEncoder);

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
