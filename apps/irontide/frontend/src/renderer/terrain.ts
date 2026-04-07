/**
 * Instanced terrain renderer using WebGPU.
 * Renders isometric diamond tiles with fog-of-war.
 */

import { Camera, TILE_WIDTH, TILE_HEIGHT } from './camera';
import shaderCode from './shaders/terrain.wgsl?raw';

/** Max tiles we can render in a single draw (256*256). */
const MAX_INSTANCES = 65536;

/** Per-instance data: screen_pos(vec2f) + tile_type(f32) + fog_state(f32) = 16 bytes. */
const INSTANCE_STRIDE = 16;

export class TerrainRenderer {
  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private uniformBindGroup!: GPUBindGroup;
  private instanceBuffer!: GPUBuffer;
  private instanceCount = 0;

  async init(device: GPUDevice, format: GPUTextureFormat): Promise<void> {
    const shaderModule = device.createShaderModule({ code: shaderCode });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    });

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [
          {
            // Instance buffer
            arrayStride: INSTANCE_STRIDE,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },  // screen_pos
              { shaderLocation: 1, offset: 8, format: 'float32' },    // tile_type
              { shaderLocation: 2, offset: 12, format: 'float32' },   // fog_state
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });

    // Uniform buffer — just resolution (vec2<f32>, 8 bytes, padded to 16 for alignment)
    this.uniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.uniformBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
      ],
    });

    // Instance buffer
    this.instanceBuffer = device.createBuffer({
      size: MAX_INSTANCES * INSTANCE_STRIDE,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  /**
   * Build instance data for visible tiles only (frustum culling).
   */
  updateInstances(
    device: GPUDevice,
    camera: Camera,
    terrainData: Uint8Array,
    fogData: Uint8Array,
    mapSize: number,
    canvasW: number,
    canvasH: number,
  ): void {
    // Write resolution uniform
    const uniformData = new Float32Array([canvasW, canvasH, 0, 0]);
    device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    // Determine visible bounds
    const bounds = camera.getVisibleBounds();
    const minX = Math.max(0, bounds.minX);
    const minY = Math.max(0, bounds.minY);
    const maxX = Math.min(mapSize - 1, bounds.maxX);
    const maxY = Math.min(mapSize - 1, bounds.maxY);

    const visibleW = maxX - minX + 1;
    const visibleH = maxY - minY + 1;
    const maxCount = Math.min(visibleW * visibleH, MAX_INSTANCES);

    const data = new Float32Array(maxCount * 4); // 4 floats per instance
    let count = 0;

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        if (count >= MAX_INSTANCES) break;
        const screen = camera.tileToScreen(tx, ty);
        const idx = ty * mapSize + tx;
        const tileType = terrainData[idx];
        const fog = fogData[idx];

        const base = count * 4;
        data[base] = screen.x;
        data[base + 1] = screen.y;
        data[base + 2] = tileType;
        data[base + 3] = fog;
        count++;
      }
    }

    this.instanceCount = count;
    if (count > 0) {
      device.queue.writeBuffer(this.instanceBuffer, 0, data, 0, count * 4);
    }
  }

  render(passEncoder: GPURenderPassEncoder): void {
    if (this.instanceCount === 0) return;
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.uniformBindGroup);
    passEncoder.setVertexBuffer(0, this.instanceBuffer);
    passEncoder.draw(6, this.instanceCount, 0, 0);
  }
}
