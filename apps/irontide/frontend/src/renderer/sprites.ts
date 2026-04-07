/**
 * Instanced sprite renderer for units and buildings.
 * Uses WebGPU instanced quads with per-instance color and health bar.
 */

import { Camera } from './camera.js';
import { RenderUnit } from '../wasm/bridge.js';
import shaderCode from './shaders/sprites.wgsl?raw';

const MAX_SPRITES = 2048;

/** Per-instance: screen_pos(vec2) + size(vec2) + color(vec3) + health(f32) = 8 floats = 32 bytes */
const INSTANCE_STRIDE = 32;

/** Team colors: Player 0 = blue, Player 1 = red */
const TEAM_COLORS: [number, number, number][] = [
  [0.2, 0.5, 0.9],
  [0.9, 0.2, 0.2],
];

/** Sprite sizes by sprite_id: [width, height] */
function getSpriteSize(spriteId: number): [number, number] {
  if (spriteId === 0) return [16, 20];  // Worker
  if (spriteId === 1) return [14, 22];  // Rifleman
  if (spriteId === 2) return [24, 20];  // Tank
  if (spriteId >= 100) return [48, 48]; // Buildings
  return [16, 20]; // fallback
}

export class SpriteRenderer {
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
            arrayStride: INSTANCE_STRIDE,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },   // screen_pos
              { shaderLocation: 1, offset: 8, format: 'float32x2' },   // size
              { shaderLocation: 2, offset: 16, format: 'float32x3' },  // color
              { shaderLocation: 3, offset: 28, format: 'float32' },    // health
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{
          format,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    });

    this.uniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.uniformBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    this.instanceBuffer = device.createBuffer({
      size: MAX_SPRITES * INSTANCE_STRIDE,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  /**
   * Convert render data to screen-space instanced sprite data.
   */
  updateInstances(
    device: GPUDevice,
    camera: Camera,
    renderData: RenderUnit[],
    canvasW: number,
    canvasH: number,
  ): void {
    const uniformData = new Float32Array([canvasW, canvasH, 0, 0]);
    device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    const count = Math.min(renderData.length, MAX_SPRITES);
    const data = new Float32Array(count * 8); // 8 floats per instance

    for (let i = 0; i < count; i++) {
      const unit = renderData[i];
      const screen = camera.tileToScreen(unit.x, unit.y);
      const [w, h] = getSpriteSize(unit.s);
      const scaledW = w * camera.zoom;
      const scaledH = h * camera.zoom;
      const teamIdx = Math.min(unit.t, TEAM_COLORS.length - 1);
      const color = TEAM_COLORS[teamIdx] ?? TEAM_COLORS[0];

      const base = i * 8;
      data[base] = screen.x;
      data[base + 1] = screen.y;
      data[base + 2] = scaledW;
      data[base + 3] = scaledH;
      data[base + 4] = color[0];
      data[base + 5] = color[1];
      data[base + 6] = color[2];
      data[base + 7] = unit.h;
    }

    this.instanceCount = count;
    if (count > 0) {
      device.queue.writeBuffer(this.instanceBuffer, 0, data, 0, count * 8);
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
