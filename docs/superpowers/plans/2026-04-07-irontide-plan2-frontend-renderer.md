# Iron Tide — Plan 2: Frontend & Renderer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the browser frontend: Vite project, WASM bridge, WebGPU isometric renderer, input handling, camera, HUD, and lobby UI. Deliverable: single-player game playable in browser (no networking yet — local tick loop).

**Architecture:** TypeScript + Vite, vanilla DOM for UI (no React), WebGPU for rendering. Rust engine runs in WASM, JS reads render buffers and draws sprites. Camera and input are JS-side. HUD is DOM overlay.

**Tech Stack:** TypeScript, Vite, WebGPU (WGSL shaders), wasm-bindgen output

**Depends on:** Plan 1 (Engine Completion) must be done first.

**Reference specs:**
- Game design: `docs/superpowers/specs/2026-04-07-irontide-game-design.md`
- Technical architecture: `docs/superpowers/specs/2026-04-07-irontide-technical-architecture.md`

---

### Task 1: Vite project scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "irontide-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["@webgpu/types"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
  define: {
    '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Iron Tide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #111; color: #eee; font-family: system-ui, sans-serif; overflow: hidden; }
    #app { width: 100vw; height: 100vh; position: relative; }
    canvas { display: block; width: 100%; height: 100%; }
    #lobby { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
    #lobby.hidden { display: none; }
    #hud { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
    #hud > * { pointer-events: auto; }
  </style>
</head>
<body>
  <div id="app">
    <div id="lobby">
      <h1>IRON TIDE</h1>
      <p>Loading engine...</p>
    </div>
    <canvas id="game-canvas"></canvas>
    <div id="hud" class="hidden"></div>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 5: Create minimal main.ts**

```typescript
console.log('Iron Tide loading...');

async function init() {
  // Will be expanded in subsequent tasks
  const lobby = document.getElementById('lobby')!;
  lobby.querySelector('p')!.textContent = 'Engine loaded. Waiting for game start...';
}

init().catch(console.error);
```

- [ ] **Step 6: Install deps and verify dev server starts**

Run:
```bash
cd apps/irontide/frontend
npm install
npm install -D @webgpu/types
npx vite --host 0.0.0.0 &
sleep 3 && curl -s http://localhost:5173 | head -5
kill %1
```

Expected: HTML response with "IRON TIDE" visible.

- [ ] **Step 7: Remove .gitkeep files**

```bash
find apps/irontide/frontend/src -name '.gitkeep' -delete
```

- [ ] **Step 8: Commit**

```bash
git add apps/irontide/frontend/
git commit -m "feat(irontide): scaffold Vite + TypeScript frontend"
```

---

### Task 2: WASM bridge

Build the WASM module and create a typed TypeScript wrapper.

**Files:**
- Create: `frontend/src/wasm/bridge.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Build WASM**

Run: `cd apps/irontide && ./tools/build-wasm.sh`

This outputs to `frontend/src/wasm/pkg/`. Verify the files exist:
```bash
ls apps/irontide/frontend/src/wasm/pkg/
```

Expected: `irontide.js`, `irontide_bg.wasm`, `irontide.d.ts`

- [ ] **Step 2: Create bridge.ts**

```typescript
import init, * as wasm from './pkg/irontide.js';

let initialized = false;

export async function initWasm(): Promise<void> {
  if (initialized) return;
  await init();
  initialized = true;
}

export function initGame(seed: number, mapSeed: number, playerCount: number): void {
  wasm.init_game(seed, mapSeed, playerCount);
}

export function tick(commandsJson: string): void {
  wasm.tick(commandsJson);
}

export function fastForward(ticks: number): void {
  wasm.fast_forward(ticks);
}

export function getTickCount(): number {
  return wasm.get_tick_count();
}

export function getUnitCount(): number {
  return wasm.get_unit_count();
}

export function getUnitCountForPlayer(playerId: number): number {
  return wasm.get_unit_count_for_player(playerId);
}

export function getUnitsByType(playerId: number, unitType: string): number[] {
  return JSON.parse(wasm.get_units_by_type(playerId, unitType));
}

export function getUnitPosition(entityId: number): { x: number; y: number } | null {
  const result = wasm.get_unit_position(entityId);
  if (result === null || result === undefined) return null;
  return result as { x: number; y: number };
}

export function getUnitHealth(entityId: number): { current: number; max: number } | null {
  const result = wasm.get_unit_health(entityId);
  if (result === 'null') return null;
  return JSON.parse(result);
}

export function getUnitState(entityId: number): string {
  return wasm.get_unit_state(entityId);
}

export function getUnitCarrying(entityId: number): number {
  return wasm.get_unit_carrying(entityId);
}

export function getResources(playerId: number): number {
  return wasm.get_resources(playerId);
}

export function getResourceNodes(): Array<{ id: number; x: number; y: number; remaining: number }> {
  return JSON.parse(wasm.get_resource_nodes());
}

export function getBuildingCountForPlayer(playerId: number): number {
  return wasm.get_building_count_for_player(playerId);
}

export function getBuildingsByType(playerId: number, buildingType: string): number[] {
  return JSON.parse(wasm.get_buildings_by_type(playerId, buildingType));
}

export function getBuildingProgress(entityId: number): number {
  return wasm.get_building_progress(entityId);
}

export function getProductionQueue(entityId: number): Array<{ unitType: string; progress: number }> {
  return JSON.parse(wasm.get_production_queue(entityId));
}

export function getStateChecksum(): string {
  return wasm.get_state_checksum();
}

export function getGameState(): string {
  return wasm.get_game_state();
}

export function getGameResult(): { winner: number | null; reason: string } {
  return JSON.parse(wasm.get_game_result());
}

export function getRenderData(viewerTeam: number): Array<{
  id: number; s: number; x: number; y: number; t: number; h: number;
}> {
  return JSON.parse(wasm.get_render_data(viewerTeam));
}

export function getFogData(team: number): Uint8Array {
  return wasm.get_fog_data(team);
}

export function getTerrainData(): Uint8Array {
  return wasm.get_terrain_data();
}

export function getMapSize(): number {
  return wasm.get_map_size();
}

export function isTileVisible(playerId: number, tileX: number, tileY: number): boolean {
  return wasm.is_tile_visible(playerId, tileX, tileY);
}

export function getVisibleTileCount(playerId: number): number {
  return wasm.get_visible_tile_count(playerId);
}

export function getTileType(tileX: number, tileY: number): string {
  return wasm.get_tile_type(tileX, tileY);
}

export function isPathable(tileX: number, tileY: number): boolean {
  return wasm.is_pathable(tileX, tileY);
}

export function issueCommand(json: string): void {
  wasm.issue_command(json);
}
```

- [ ] **Step 3: Update main.ts to init WASM**

```typescript
import { initWasm, initGame, getUnitCount, getMapSize } from './wasm/bridge.js';

async function init() {
  const lobby = document.getElementById('lobby')!;
  lobby.querySelector('p')!.textContent = 'Loading engine...';

  await initWasm();

  // Init a test game
  initGame(42, 100, 2);
  console.log(`Game initialized: ${getUnitCount()} units, ${getMapSize()}x${getMapSize()} map`);

  lobby.querySelector('p')!.textContent = `Engine loaded. ${getUnitCount()} units on ${getMapSize()}x${getMapSize()} map.`;
}

init().catch(console.error);
```

- [ ] **Step 4: Verify WASM loads in browser**

Run dev server, navigate to localhost:5173. Check console for "Game initialized" log.

```bash
cd apps/irontide/frontend && npx vite --host 0.0.0.0 &
sleep 3
# Use Playwright to verify
```

- [ ] **Step 5: Commit**

```bash
git add apps/irontide/frontend/src/wasm/bridge.ts apps/irontide/frontend/src/main.ts
git commit -m "feat(irontide): WASM bridge with typed TypeScript API"
```

---

### Task 3: WebGPU renderer — initialization and terrain pass

**Files:**
- Create: `frontend/src/renderer/index.ts`
- Create: `frontend/src/renderer/terrain.ts`
- Create: `frontend/src/renderer/camera.ts`
- Create: `frontend/src/renderer/shaders/terrain.wgsl`

- [ ] **Step 1: Create camera.ts**

```typescript
export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  private canvasWidth = 0;
  private canvasHeight = 0;

  /** Isometric projection constants (SC2-style ~60 degree angle). */
  static readonly TILE_WIDTH = 64;
  static readonly TILE_HEIGHT = 32; // Half of width for ~60 degree iso

  setCanvasSize(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  /** Convert tile coordinates to screen pixel coordinates. */
  tileToScreen(tileX: number, tileY: number): { sx: number; sy: number } {
    const isoX = (tileX - tileY) * (Camera.TILE_WIDTH / 2);
    const isoY = (tileX + tileY) * (Camera.TILE_HEIGHT / 2);
    return {
      sx: (isoX - this.x) * this.zoom + this.canvasWidth / 2,
      sy: (isoY - this.y) * this.zoom + this.canvasHeight / 2,
    };
  }

  /** Convert screen coordinates to tile coordinates. */
  screenToTile(sx: number, sy: number): { tileX: number; tileY: number } {
    const worldX = (sx - this.canvasWidth / 2) / this.zoom + this.x;
    const worldY = (sy - this.canvasHeight / 2) / this.zoom + this.y;
    const tileX = (worldX / (Camera.TILE_WIDTH / 2) + worldY / (Camera.TILE_HEIGHT / 2)) / 2;
    const tileY = (worldY / (Camera.TILE_HEIGHT / 2) - worldX / (Camera.TILE_WIDTH / 2)) / 2;
    return { tileX: Math.floor(tileX), tileY: Math.floor(tileY) };
  }

  /** Pan the camera by pixel delta. */
  pan(dx: number, dy: number) {
    this.x += dx / this.zoom;
    this.y += dy / this.zoom;
  }

  /** Zoom toward a screen point. */
  zoomAt(factor: number, _sx: number, _sy: number) {
    this.zoom = Math.max(0.25, Math.min(4, this.zoom * factor));
  }

  /** Center camera on a tile position. */
  centerOn(tileX: number, tileY: number) {
    const isoX = (tileX - tileY) * (Camera.TILE_WIDTH / 2);
    const isoY = (tileX + tileY) * (Camera.TILE_HEIGHT / 2);
    this.x = isoX;
    this.y = isoY;
  }

  /** Get visible tile bounds for frustum culling. */
  getVisibleBounds(): { minTileX: number; maxTileX: number; minTileY: number; maxTileY: number } {
    const tl = this.screenToTile(0, 0);
    const tr = this.screenToTile(this.canvasWidth, 0);
    const bl = this.screenToTile(0, this.canvasHeight);
    const br = this.screenToTile(this.canvasWidth, this.canvasHeight);
    const pad = 3;
    return {
      minTileX: Math.min(tl.tileX, tr.tileX, bl.tileX, br.tileX) - pad,
      maxTileX: Math.max(tl.tileX, tr.tileX, bl.tileX, br.tileX) + pad,
      minTileY: Math.min(tl.tileY, tr.tileY, bl.tileY, br.tileY) - pad,
      maxTileY: Math.max(tl.tileY, tr.tileY, bl.tileY, br.tileY) + pad,
    };
  }
}
```

- [ ] **Step 2: Create terrain WGSL shader**

Create `frontend/src/renderer/shaders/terrain.wgsl`:

```wgsl
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
};

struct Uniforms {
    resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct TileInstance {
    @location(0) screen_pos: vec2<f32>,   // Pre-computed screen position
    @location(1) tile_type: f32,          // 0=grass, 1=water, 2=rock, 3=ore
    @location(2) fog_state: f32,          // 0=unexplored, 1=fog, 2=visible
};

// Quad vertices (two triangles forming a diamond)
var<private> quad_verts: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -0.5),   // top
    vec2<f32>(0.5, 0.0),    // right
    vec2<f32>(0.0, 0.5),    // bottom
    vec2<f32>(0.0, -0.5),   // top
    vec2<f32>(0.0, 0.5),    // bottom
    vec2<f32>(-0.5, 0.0),   // left
);

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, instance: TileInstance) -> VertexOutput {
    var out: VertexOutput;
    let v = quad_verts[vid];
    let tile_w: f32 = 64.0;
    let tile_h: f32 = 32.0;

    let px = instance.screen_pos.x + v.x * tile_w;
    let py = instance.screen_pos.y + v.y * tile_h;

    // Convert to clip space
    out.position = vec4<f32>(
        px / uniforms.resolution.x * 2.0 - 1.0,
        1.0 - py / uniforms.resolution.y * 2.0,
        0.0, 1.0
    );

    // Color by tile type
    var base_color: vec3<f32>;
    if instance.tile_type < 0.5 {
        base_color = vec3<f32>(0.35, 0.55, 0.25); // grass
    } else if instance.tile_type < 1.5 {
        base_color = vec3<f32>(0.2, 0.35, 0.55);  // water
    } else if instance.tile_type < 2.5 {
        base_color = vec3<f32>(0.4, 0.38, 0.35);  // rock
    } else {
        base_color = vec3<f32>(0.7, 0.55, 0.2);   // ore
    }

    // Apply fog
    if instance.fog_state < 0.5 {
        base_color = vec3<f32>(0.05, 0.05, 0.08); // unexplored = near black
    } else if instance.fog_state < 1.5 {
        base_color = base_color * 0.4; // fog = darkened
    }

    out.color = base_color;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(in.color, 1.0);
}
```

- [ ] **Step 3: Create terrain.ts renderer**

```typescript
import { Camera } from './camera.js';

export class TerrainRenderer {
  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private uniformBindGroup!: GPUBindGroup;
  private instanceBuffer!: GPUBuffer;
  private maxInstances = 256 * 256;
  private instanceCount = 0;

  async init(device: GPUDevice, format: GPUTextureFormat, shaderCode: string) {
    const shaderModule = device.createShaderModule({ code: shaderCode });

    this.uniformBuffer = device.createBuffer({
      size: 8, // vec2<f32> resolution
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: 'uniform' },
      }],
    });

    this.uniformBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 16, // 2 floats screen_pos + 1 float tile_type + 1 float fog
          stepMode: 'instance',
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' },
            { shaderLocation: 1, offset: 8, format: 'float32' },
            { shaderLocation: 2, offset: 12, format: 'float32' },
          ],
        }],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list' },
    });

    this.instanceBuffer = device.createBuffer({
      size: this.maxInstances * 16,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  updateInstances(
    device: GPUDevice,
    camera: Camera,
    terrainData: Uint8Array,
    fogData: Uint8Array,
    mapSize: number,
    canvasWidth: number,
    canvasHeight: number,
  ) {
    device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([canvasWidth, canvasHeight]));

    const bounds = camera.getVisibleBounds();
    const data = new Float32Array(this.maxInstances * 4);
    let count = 0;

    for (let ty = Math.max(0, bounds.minTileY); ty <= Math.min(mapSize - 1, bounds.maxTileY); ty++) {
      for (let tx = Math.max(0, bounds.minTileX); tx <= Math.min(mapSize - 1, bounds.maxTileX); tx++) {
        const { sx, sy } = camera.tileToScreen(tx + 0.5, ty + 0.5);
        if (sx < -64 || sx > canvasWidth + 64 || sy < -32 || sy > canvasHeight + 32) continue;

        const idx = ty * mapSize + tx;
        const offset = count * 4;
        data[offset] = sx;
        data[offset + 1] = sy;
        data[offset + 2] = terrainData[idx]; // tile type
        data[offset + 3] = fogData[idx];     // fog state
        count++;
        if (count >= this.maxInstances) break;
      }
      if (count >= this.maxInstances) break;
    }

    this.instanceCount = count;
    device.queue.writeBuffer(this.instanceBuffer, 0, data.buffer, 0, count * 16);
  }

  render(passEncoder: GPURenderPassEncoder) {
    if (this.instanceCount === 0) return;
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.uniformBindGroup);
    passEncoder.setVertexBuffer(0, this.instanceBuffer);
    passEncoder.draw(6, this.instanceCount); // 6 verts per diamond, N instances
  }
}
```

- [ ] **Step 4: Create renderer/index.ts — WebGPU init + render loop**

```typescript
import { Camera } from './camera.js';
import { TerrainRenderer } from './terrain.js';
import * as wasm from '../wasm/bridge.js';

// Import shader as raw text
import terrainShaderCode from './shaders/terrain.wgsl?raw';

export class Renderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;
  private terrain!: TerrainRenderer;
  camera = new Camera();
  private canvas!: HTMLCanvasElement;
  private terrainData: Uint8Array | null = null;
  private viewerTeam = 0;

  async init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    if (!navigator.gpu) {
      throw new Error('WebGPU not supported. Use Chrome, Edge, or Safari 18+.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');
    this.device = await adapter.requestDevice();

    this.context = canvas.getContext('webgpu')!;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'opaque',
    });

    this.terrain = new TerrainRenderer();
    await this.terrain.init(this.device, this.format, terrainShaderCode);

    // Cache terrain (it doesn't change)
    this.terrainData = wasm.getTerrainData();

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setViewerTeam(team: number) {
    this.viewerTeam = team;
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.camera.setCanvasSize(this.canvas.width, this.canvas.height);
  }

  renderFrame() {
    const fogData = wasm.getFogData(this.viewerTeam);
    const mapSize = wasm.getMapSize();

    // Update terrain instances
    this.terrain.updateInstances(
      this.device,
      this.camera,
      this.terrainData!,
      fogData,
      mapSize,
      this.canvas.width,
      this.canvas.height,
    );

    // Begin render pass
    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.05, g: 0.05, b: 0.08, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    // Pass 1: Terrain
    this.terrain.render(passEncoder);

    // Pass 2: Sprites (Task 4)
    // Pass 3: Fog overlay (already handled in terrain shader)

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
```

- [ ] **Step 5: Wire renderer into main.ts**

```typescript
import { initWasm, initGame, getMapSize, tick } from './wasm/bridge.js';
import { Renderer } from './renderer/index.js';

const renderer = new Renderer();
let gameStarted = false;

async function init() {
  const lobby = document.getElementById('lobby')!;
  lobby.querySelector('p')!.textContent = 'Loading engine...';

  await initWasm();
  initGame(42, 100, 2);

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  await renderer.init(canvas);

  // Center camera on player 0's starting area
  renderer.camera.centerOn(10, 10);

  lobby.classList.add('hidden');
  gameStarted = true;

  // Game loop
  function gameLoop() {
    if (!gameStarted) return;
    tick(''); // Advance simulation with no commands
    renderer.renderFrame();
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
}

init().catch(err => {
  console.error(err);
  document.getElementById('lobby')!.querySelector('p')!.textContent = `Error: ${err.message}`;
});
```

- [ ] **Step 6: Verify terrain renders**

Build WASM, start dev server, open browser. Should see colored isometric diamond tiles.

```bash
cd apps/irontide && ./tools/build-wasm.sh
cd frontend && npx vite --host 0.0.0.0 &
```

- [ ] **Step 7: Commit**

```bash
git add apps/irontide/frontend/src/
git commit -m "feat(irontide): WebGPU terrain renderer with isometric camera"
```

---

### Task 4: Sprite pass — render units and buildings

**Files:**
- Create: `frontend/src/renderer/sprites.ts`
- Create: `frontend/src/renderer/shaders/sprites.wgsl`
- Modify: `frontend/src/renderer/index.ts`

- [ ] **Step 1: Create sprites WGSL shader**

Create `frontend/src/renderer/shaders/sprites.wgsl`:

```wgsl
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) health_pct: f32,
    @location(2) quad_uv: vec2<f32>,
};

struct Uniforms {
    resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct SpriteInstance {
    @location(0) screen_pos: vec2<f32>,
    @location(1) size: vec2<f32>,       // width, height in pixels
    @location(2) color: vec3<f32>,      // team color
    @location(3) health: f32,           // 0.0 - 1.0
};

var<private> quad_verts: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
    vec2<f32>(-0.5, -1.0),
    vec2<f32>(0.5, -1.0),
    vec2<f32>(0.5, 0.0),
    vec2<f32>(-0.5, -1.0),
    vec2<f32>(0.5, 0.0),
    vec2<f32>(-0.5, 0.0),
);

var<private> quad_uvs: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 1.0),
);

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, instance: SpriteInstance) -> VertexOutput {
    var out: VertexOutput;
    let v = quad_verts[vid];
    let uv = quad_uvs[vid];

    let px = instance.screen_pos.x + v.x * instance.size.x;
    let py = instance.screen_pos.y + v.y * instance.size.y;

    out.position = vec4<f32>(
        px / uniforms.resolution.x * 2.0 - 1.0,
        1.0 - py / uniforms.resolution.y * 2.0,
        0.0, 1.0
    );
    out.color = instance.color;
    out.health_pct = instance.health;
    out.quad_uv = uv;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Placeholder: colored rectangle with health bar
    // In production this would sample a sprite atlas texture
    var color = in.color;

    // Health bar at top of sprite
    if in.quad_uv.y < 0.1 {
        if in.quad_uv.x < in.health_pct {
            // Green for health remaining
            color = mix(vec3<f32>(0.0, 1.0, 0.0), vec3<f32>(1.0, 0.0, 0.0), 1.0 - in.health_pct);
        } else {
            color = vec3<f32>(0.2, 0.2, 0.2); // Dark for missing health
        }
    }

    return vec4<f32>(color, 1.0);
}
```

- [ ] **Step 2: Create sprites.ts**

```typescript
import { Camera } from './camera.js';

const TEAM_COLORS: [number, number, number][] = [
  [0.2, 0.5, 0.9],   // Player 0: blue
  [0.9, 0.2, 0.2],   // Player 1: red
];

/** Sprite size by sprite_id. */
function getSpriteSize(spriteId: number): [number, number] {
  if (spriteId >= 100) {
    // Buildings
    return [48, 48];
  }
  switch (spriteId) {
    case 0: return [16, 20]; // Worker
    case 1: return [14, 22]; // Rifleman
    case 2: return [24, 20]; // Tank
    default: return [16, 20];
  }
}

export class SpriteRenderer {
  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private uniformBindGroup!: GPUBindGroup;
  private instanceBuffer!: GPUBuffer;
  private maxInstances = 2048;
  private instanceCount = 0;

  async init(device: GPUDevice, format: GPUTextureFormat, shaderCode: string) {
    const shaderModule = device.createShaderModule({ code: shaderCode });

    this.uniformBuffer = device.createBuffer({
      size: 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: 'uniform' },
      }],
    });

    this.uniformBindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 32, // 2f screen_pos + 2f size + 3f color + 1f health
          stepMode: 'instance',
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' },
            { shaderLocation: 1, offset: 8, format: 'float32x2' },
            { shaderLocation: 2, offset: 16, format: 'float32x3' },
            { shaderLocation: 3, offset: 28, format: 'float32' },
          ],
        }],
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

    this.instanceBuffer = device.createBuffer({
      size: this.maxInstances * 32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  updateInstances(
    device: GPUDevice,
    camera: Camera,
    renderData: Array<{ id: number; s: number; x: number; y: number; t: number; h: number }>,
    canvasWidth: number,
    canvasHeight: number,
  ) {
    device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([canvasWidth, canvasHeight]));

    const data = new Float32Array(this.maxInstances * 8);
    let count = 0;

    for (const unit of renderData) {
      const { sx, sy } = camera.tileToScreen(unit.x, unit.y);
      if (sx < -100 || sx > canvasWidth + 100 || sy < -100 || sy > canvasHeight + 100) continue;

      const [w, h] = getSpriteSize(unit.s);
      const teamColor = TEAM_COLORS[unit.t] || [0.5, 0.5, 0.5];
      const scaledW = w * camera.zoom;
      const scaledH = h * camera.zoom;

      const offset = count * 8;
      data[offset] = sx;
      data[offset + 1] = sy;
      data[offset + 2] = scaledW;
      data[offset + 3] = scaledH;
      data[offset + 4] = teamColor[0];
      data[offset + 5] = teamColor[1];
      data[offset + 6] = teamColor[2];
      data[offset + 7] = unit.h;
      count++;
      if (count >= this.maxInstances) break;
    }

    this.instanceCount = count;
    device.queue.writeBuffer(this.instanceBuffer, 0, data.buffer, 0, count * 32);
  }

  render(passEncoder: GPURenderPassEncoder) {
    if (this.instanceCount === 0) return;
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.uniformBindGroup);
    passEncoder.setVertexBuffer(0, this.instanceBuffer);
    passEncoder.draw(6, this.instanceCount);
  }
}
```

- [ ] **Step 3: Wire sprite renderer into index.ts**

Add to `Renderer` class:
```typescript
import { SpriteRenderer } from './sprites.js';
import spriteShaderCode from './shaders/sprites.wgsl?raw';

// In init():
this.sprites = new SpriteRenderer();
await this.sprites.init(this.device, this.format, spriteShaderCode);

// In renderFrame():
const renderData = wasm.getRenderData(this.viewerTeam);
this.sprites.updateInstances(this.device, this.camera, renderData, this.canvas.width, this.canvas.height);

// In render pass, after terrain:
this.sprites.render(passEncoder);
```

- [ ] **Step 4: Verify units render as colored rectangles**

Start dev server. Should see colored rectangles at unit positions on the terrain.

- [ ] **Step 5: Commit**

```bash
git add apps/irontide/frontend/src/renderer/
git commit -m "feat(irontide): WebGPU sprite renderer (colored placeholders with health bars)"
```

---

### Task 5: Input handling — mouse and keyboard

**Files:**
- Create: `frontend/src/input/index.ts`
- Create: `frontend/src/input/mouse.ts`
- Create: `frontend/src/input/keyboard.ts`
- Create: `frontend/src/game/state.ts`
- Create: `frontend/src/game/commands.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Create game/state.ts — client-side state**

```typescript
export interface ClientState {
  selectedEntityIds: number[];
  playerId: number;
  controlGroups: Map<number, number[]>;
}

export function createClientState(): ClientState {
  return {
    selectedEntityIds: [],
    playerId: 0,
    controlGroups: new Map(),
  };
}
```

- [ ] **Step 2: Create game/commands.ts — input to game command translation**

```typescript
import { ClientState } from './state.js';

export interface GameCommand {
  type: string;
  [key: string]: unknown;
}

export function createMoveCommand(state: ClientState, tileX: number, tileY: number): GameCommand {
  return {
    type: 'Move',
    unit_ids: state.selectedEntityIds,
    target_x: tileX,
    target_y: tileY,
  };
}

export function createAttackMoveCommand(state: ClientState, tileX: number, tileY: number): GameCommand {
  return {
    type: 'AttackMove',
    unit_ids: state.selectedEntityIds,
    target_x: tileX,
    target_y: tileY,
  };
}

export function createAttackCommand(state: ClientState, targetEntity: number): GameCommand {
  return {
    type: 'Attack',
    unit_ids: state.selectedEntityIds,
    target: targetEntity,
  };
}

export function createBuildCommand(builder: number, buildingType: string, tileX: number, tileY: number): GameCommand {
  return {
    type: 'Build',
    builder,
    building_type: buildingType,
    x: tileX,
    y: tileY,
  };
}

export function createTrainCommand(building: number, unitType: string): GameCommand {
  return {
    type: 'Train',
    building,
    unit_type: unitType,
  };
}

export function createStopCommand(state: ClientState): GameCommand {
  return {
    type: 'Stop',
    unit_ids: state.selectedEntityIds,
  };
}
```

- [ ] **Step 3: Create input/keyboard.ts**

```typescript
import { Camera } from '../renderer/camera.js';

const PAN_SPEED = 8; // pixels per frame

export class KeyboardInput {
  private pressed = new Set<string>();

  init() {
    window.addEventListener('keydown', (e) => {
      this.pressed.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.pressed.delete(e.key.toLowerCase());
    });
  }

  isPressed(key: string): boolean {
    return this.pressed.has(key);
  }

  /** Apply camera panning from WASD. Call once per frame. */
  updateCamera(camera: Camera) {
    let dx = 0, dy = 0;
    if (this.pressed.has('w') || this.pressed.has('arrowup')) dy -= PAN_SPEED;
    if (this.pressed.has('s') || this.pressed.has('arrowdown')) dy += PAN_SPEED;
    if (this.pressed.has('a') || this.pressed.has('arrowleft')) dx -= PAN_SPEED;
    if (this.pressed.has('d') || this.pressed.has('arrowright')) dx += PAN_SPEED;
    if (dx !== 0 || dy !== 0) {
      camera.pan(dx, dy);
    }
  }
}
```

- [ ] **Step 4: Create input/mouse.ts**

```typescript
import { Camera } from '../renderer/camera.js';

export type MouseCallback = (event: {
  type: 'click' | 'rightclick' | 'boxselect';
  screenX: number;
  screenY: number;
  tileX: number;
  tileY: number;
  endTileX?: number;
  endTileY?: number;
}) => void;

export class MouseInput {
  private canvas!: HTMLCanvasElement;
  private camera!: Camera;
  private callback!: MouseCallback;
  private dragStart: { x: number; y: number } | null = null;
  private isDragging = false;

  init(canvas: HTMLCanvasElement, camera: Camera, callback: MouseCallback) {
    this.canvas = canvas;
    this.camera = camera;
    this.callback = callback;

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => this.onWheel(e));
  }

  private getCanvasPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
    };
  }

  private onMouseDown(e: MouseEvent) {
    if (e.button === 0) { // Left click
      const pos = this.getCanvasPos(e);
      this.dragStart = pos;
      this.isDragging = false;
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.dragStart) {
      const pos = this.getCanvasPos(e);
      const dx = pos.x - this.dragStart.x;
      const dy = pos.y - this.dragStart.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this.isDragging = true;
      }
    }
  }

  private onMouseUp(e: MouseEvent) {
    const pos = this.getCanvasPos(e);
    const tile = this.camera.screenToTile(pos.x, pos.y);

    if (e.button === 2) { // Right click
      this.callback({
        type: 'rightclick',
        screenX: pos.x,
        screenY: pos.y,
        tileX: tile.tileX,
        tileY: tile.tileY,
      });
    } else if (e.button === 0) {
      if (this.isDragging && this.dragStart) {
        // Box select
        const startTile = this.camera.screenToTile(this.dragStart.x, this.dragStart.y);
        this.callback({
          type: 'boxselect',
          screenX: this.dragStart.x,
          screenY: this.dragStart.y,
          tileX: startTile.tileX,
          tileY: startTile.tileY,
          endTileX: tile.tileX,
          endTileY: tile.tileY,
        });
      } else {
        // Single click
        this.callback({
          type: 'click',
          screenX: pos.x,
          screenY: pos.y,
          tileX: tile.tileX,
          tileY: tile.tileY,
        });
      }
    }

    this.dragStart = null;
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const pos = this.getCanvasPos(e);
    this.camera.zoomAt(factor, pos.x, pos.y);
  }
}
```

- [ ] **Step 5: Create input/index.ts — combines mouse/keyboard and translates to game commands**

```typescript
import { Camera } from '../renderer/camera.js';
import { KeyboardInput } from './keyboard.js';
import { MouseInput } from './mouse.js';
import { ClientState } from '../game/state.js';
import * as wasm from '../wasm/bridge.js';

export class InputManager {
  private keyboard = new KeyboardInput();
  private mouse = new MouseInput();
  private state: ClientState;
  private pendingCommands: string[] = [];
  private attackMoveMode = false;

  constructor(state: ClientState) {
    this.state = state;
  }

  init(canvas: HTMLCanvasElement, camera: Camera) {
    this.keyboard.init();
    this.mouse.init(canvas, camera, (event) => this.handleMouse(event));

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      // Attack-move
      if (key === 'a' && this.state.selectedEntityIds.length > 0) {
        this.attackMoveMode = true;
      }
      // Stop
      if (key === 's') {
        this.pushCommand(JSON.stringify({
          type: 'Stop',
          unit_ids: this.state.selectedEntityIds,
        }));
      }
      // Control groups
      if (e.ctrlKey && key >= '1' && key <= '9') {
        e.preventDefault();
        const group = parseInt(key);
        this.state.controlGroups.set(group, [...this.state.selectedEntityIds]);
      } else if (!e.ctrlKey && key >= '1' && key <= '9') {
        const group = parseInt(key);
        const ids = this.state.controlGroups.get(group);
        if (ids) {
          this.state.selectedEntityIds = [...ids];
        }
      }
    });
  }

  private handleMouse(event: {
    type: string;
    screenX: number;
    screenY: number;
    tileX: number;
    tileY: number;
    endTileX?: number;
    endTileY?: number;
  }) {
    if (event.type === 'click') {
      if (this.attackMoveMode) {
        this.pushCommand(JSON.stringify({
          type: 'AttackMove',
          unit_ids: this.state.selectedEntityIds,
          target_x: event.tileX,
          target_y: event.tileY,
        }));
        this.attackMoveMode = false;
        return;
      }
      // Try to select a unit at this position
      this.selectAtTile(event.tileX, event.tileY);
    } else if (event.type === 'rightclick') {
      if (this.state.selectedEntityIds.length > 0) {
        // Right-click = context-sensitive command
        this.pushCommand(JSON.stringify({
          type: 'Move',
          unit_ids: this.state.selectedEntityIds,
          target_x: event.tileX,
          target_y: event.tileY,
        }));
      }
    } else if (event.type === 'boxselect') {
      this.boxSelect(event.tileX, event.tileY, event.endTileX!, event.endTileY!);
    }
  }

  private selectAtTile(tileX: number, tileY: number) {
    // Find entity near this tile
    const renderData = wasm.getRenderData(this.state.playerId);
    const closest = renderData.find(u => {
      const dx = u.x - tileX;
      const dy = u.y - tileY;
      return dx * dx + dy * dy < 4; // Within ~2 tiles
    });
    if (closest) {
      this.state.selectedEntityIds = [closest.id];
    } else {
      this.state.selectedEntityIds = [];
    }
  }

  private boxSelect(tx1: number, ty1: number, tx2: number, ty2: number) {
    const minX = Math.min(tx1, tx2);
    const maxX = Math.max(tx1, tx2);
    const minY = Math.min(ty1, ty2);
    const maxY = Math.max(ty1, ty2);

    const renderData = wasm.getRenderData(this.state.playerId);
    const selected = renderData.filter(u =>
      u.x >= minX && u.x <= maxX && u.y >= minY && u.y <= maxY && u.t === this.state.playerId
    );
    this.state.selectedEntityIds = selected.map(u => u.id);
  }

  private pushCommand(json: string) {
    this.pendingCommands.push(json);
  }

  /** Call once per frame — returns accumulated commands and clears the buffer. */
  flushCommands(): string[] {
    const cmds = this.pendingCommands;
    this.pendingCommands = [];
    return cmds;
  }

  /** Call once per frame for continuous input (camera pan). */
  update(camera: Camera) {
    this.keyboard.updateCamera(camera);
  }

  getSelectedEntityIds(): number[] {
    return this.state.selectedEntityIds;
  }
}
```

- [ ] **Step 6: Wire input into main.ts game loop**

Update `main.ts` to create InputManager, call `update()` and `flushCommands()` per frame, and feed commands into `tick()`.

- [ ] **Step 7: Commit**

```bash
git add apps/irontide/frontend/src/input/ apps/irontide/frontend/src/game/
git commit -m "feat(irontide): input handling — mouse selection, right-click commands, WASD camera, control groups"
```

---

### Task 6: HUD — resources, minimap, command card

**Files:**
- Create: `frontend/src/ui/hud.ts`
- Create: `frontend/src/ui/minimap.ts`
- Create: `frontend/src/ui/command-card.ts`
- Modify: `frontend/index.html` (add HUD structure)
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Add HUD HTML structure to index.html**

Inside `<div id="hud">`:

```html
<div id="hud-top" style="position:absolute;top:8px;left:50%;transform:translateX(-50%);display:flex;gap:16px;font-size:14px;background:rgba(0,0,0,0.7);padding:6px 16px;border-radius:4px;">
  <span id="hud-ore">Ore: 500</span>
  <span id="hud-supply">Supply: 4/15</span>
</div>
<canvas id="minimap-canvas" width="200" height="200" style="position:absolute;bottom:8px;left:8px;background:#111;border:1px solid #333;"></canvas>
<div id="command-card" style="position:absolute;bottom:8px;right:8px;width:200px;background:rgba(0,0,0,0.7);padding:8px;border-radius:4px;font-size:12px;"></div>
<div id="selection-info" style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);padding:6px 12px;border-radius:4px;font-size:13px;"></div>
```

- [ ] **Step 2: Create hud.ts**

```typescript
import * as wasm from '../wasm/bridge.js';
import { ClientState } from '../game/state.js';

export class HUD {
  private oreEl!: HTMLElement;
  private supplyEl!: HTMLElement;
  private selectionEl!: HTMLElement;

  init() {
    this.oreEl = document.getElementById('hud-ore')!;
    this.supplyEl = document.getElementById('hud-supply')!;
    this.selectionEl = document.getElementById('selection-info')!;
  }

  update(state: ClientState) {
    const ore = wasm.getResources(state.playerId);
    this.oreEl.textContent = `Ore: ${ore}`;

    // Selection info
    if (state.selectedEntityIds.length > 0) {
      const first = state.selectedEntityIds[0];
      const unitState = wasm.getUnitState(first);
      const health = wasm.getUnitHealth(first);
      const healthStr = health ? `${health.current}/${health.max}` : '';
      this.selectionEl.textContent = `Selected: ${state.selectedEntityIds.length} | State: ${unitState} | HP: ${healthStr}`;
      this.selectionEl.style.display = 'block';
    } else {
      this.selectionEl.style.display = 'none';
    }
  }
}
```

- [ ] **Step 3: Create minimap.ts**

```typescript
import * as wasm from '../wasm/bridge.js';
import { Camera } from '../renderer/camera.js';

export class Minimap {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private camera!: Camera;
  private mapSize = 256;

  init(camera: Camera) {
    this.canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.camera = camera;
    this.mapSize = wasm.getMapSize();

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * this.mapSize;
      const y = (e.clientY - rect.top) / rect.height * this.mapSize;
      camera.centerOn(x, y);
    });
  }

  update(playerId: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scale = w / this.mapSize;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    // Draw terrain (simplified — just resource nodes)
    const terrain = wasm.getTerrainData();
    const fog = wasm.getFogData(playerId);
    for (let y = 0; y < this.mapSize; y += 2) {
      for (let x = 0; x < this.mapSize; x += 2) {
        const idx = y * this.mapSize + x;
        const fogVal = fog[idx];
        if (fogVal === 0) continue; // unexplored

        const tile = terrain[idx];
        if (tile === 1) ctx.fillStyle = fogVal === 2 ? '#2255aa' : '#112244';
        else if (tile === 2) ctx.fillStyle = fogVal === 2 ? '#555' : '#333';
        else if (tile === 3) ctx.fillStyle = fogVal === 2 ? '#cc9922' : '#665511';
        else ctx.fillStyle = fogVal === 2 ? '#335522' : '#1a2a11';

        ctx.fillRect(x * scale, y * scale, scale * 2, scale * 2);
      }
    }

    // Draw units
    const renderData = wasm.getRenderData(playerId);
    for (const u of renderData) {
      ctx.fillStyle = u.t === 0 ? '#4488ff' : '#ff4444';
      ctx.fillRect(u.x * scale - 1, u.y * scale - 1, 3, 3);
    }
  }
}
```

- [ ] **Step 4: Create command-card.ts**

```typescript
import * as wasm from '../wasm/bridge.js';
import { ClientState } from '../game/state.js';

export type CommandCardCallback = (action: string, ...args: unknown[]) => void;

export class CommandCard {
  private el!: HTMLElement;
  private callback!: CommandCardCallback;

  init(callback: CommandCardCallback) {
    this.el = document.getElementById('command-card')!;
    this.callback = callback;
  }

  update(state: ClientState) {
    if (state.selectedEntityIds.length === 0) {
      this.el.innerHTML = '<em>Nothing selected</em>';
      return;
    }

    const first = state.selectedEntityIds[0];
    const unitState = wasm.getUnitState(first);

    // Check if it's a building
    const bProgress = wasm.getBuildingProgress(first);
    const queue = wasm.getProductionQueue(first);

    let html = '';

    if (queue.length > 0 || bProgress < 1.0) {
      // Building selected
      if (bProgress < 1.0) {
        html += `<p>Building... ${Math.round(bProgress * 100)}%</p>`;
      } else {
        html += `<p>Production:</p>`;
        for (const item of queue) {
          html += `<p>${item.unitType} (${Math.round(item.progress * 100)}%)</p>`;
        }
        // Train buttons — this is simplified, real implementation checks building type
        html += `<button data-action="train-worker">Train Worker (W)</button>`;
        html += `<button data-action="train-rifleman">Train Rifleman (R)</button>`;
        html += `<button data-action="train-tank">Train Tank (T)</button>`;
      }
    } else {
      // Unit selected
      html += `<p>State: ${unitState}</p>`;
      html += `<button data-action="attack-move">Attack Move (A)</button>`;
      html += `<button data-action="stop">Stop (S)</button>`;
    }

    this.el.innerHTML = html;

    // Bind button clicks
    this.el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action')!;
        this.callback(action, first);
      });
    });
  }
}
```

- [ ] **Step 5: Wire HUD into main.ts**

Import HUD, Minimap, CommandCard. Initialize them. Call `update()` every frame (or every 5 frames for perf).

- [ ] **Step 6: Commit**

```bash
git add apps/irontide/frontend/src/ui/ apps/irontide/frontend/index.html
git commit -m "feat(irontide): HUD — resource display, minimap, command card, selection info"
```

---

### Task 7: Debug API bridge (window.__IRONTIDE_DEBUG)

Wire all WASM functions into the global debug API for QA agent access.

**Files:**
- Create: `frontend/src/debug.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Create debug.ts**

```typescript
import * as wasm from './wasm/bridge.js';
import { Camera } from './renderer/camera.js';
import { ClientState } from './game/state.js';

let tickMode: 'realtime' | 'manual' = 'realtime';
let manualTickCallback: (() => void) | null = null;
let camera: Camera | null = null;
let clientState: ClientState | null = null;
let frameTimes: number[] = [];
let tickTimes: number[] = [];

export function initDebugAPI(
  cam: Camera,
  state: ClientState,
  tickFn: () => void,
) {
  camera = cam;
  clientState = state;
  manualTickCallback = tickFn;

  (window as any).__IRONTIDE_DEBUG = {
    // Game state
    getGameState: () => wasm.getGameState(),
    getGameResult: () => wasm.getGameResult(),
    getTickCount: () => wasm.getTickCount(),
    getStateChecksum: () => wasm.getStateChecksum(),

    // Resources
    getResources: (pid: number) => wasm.getResources(pid),
    getResourceNodes: () => wasm.getResourceNodes(),

    // Units
    getUnitCount: (pid?: number) => pid !== undefined ? wasm.getUnitCountForPlayer(pid) : wasm.getUnitCount(),
    getUnitsByType: (pid: number, type: string) => wasm.getUnitsByType(pid, type),
    getUnitPosition: (eid: number) => wasm.getUnitPosition(eid),
    getUnitScreenPosition: (eid: number) => {
      const pos = wasm.getUnitPosition(eid);
      if (!pos || !camera) return null;
      return camera.tileToScreen(pos.x, pos.y);
    },
    getUnitHealth: (eid: number) => wasm.getUnitHealth(eid),
    getUnitState: (eid: number) => wasm.getUnitState(eid),
    getUnitCarrying: (eid: number) => wasm.getUnitCarrying(eid),

    // Buildings
    getBuildingCount: (pid?: number) => pid !== undefined ? wasm.getBuildingCountForPlayer(pid) : 0,
    getBuildingsByType: (pid: number, type: string) => wasm.getBuildingsByType(pid, type),
    getBuildingPosition: (eid: number) => wasm.getUnitPosition(eid), // Same function works for buildings
    getBuildingScreenPosition: (eid: number) => {
      const pos = wasm.getUnitPosition(eid);
      if (!pos || !camera) return null;
      return camera.tileToScreen(pos.x, pos.y);
    },
    getBuildingHealth: (eid: number) => wasm.getUnitHealth(eid),
    getBuildingProgress: (eid: number) => wasm.getBuildingProgress(eid),
    getProductionQueue: (eid: number) => wasm.getProductionQueue(eid),

    // Selection
    getSelectedEntityIds: () => clientState?.selectedEntityIds || [],
    getSelectedEntityType: (_eid: number) => {
      // Determine from render data sprite ID
      return 'unknown';
    },

    // Camera
    getCameraPosition: () => camera ? { x: camera.x, y: camera.y } : { x: 0, y: 0 },
    getCameraZoom: () => camera?.zoom || 1,

    // Fog
    isTileVisible: (pid: number, tx: number, ty: number) => wasm.isTileVisible(pid, tx, ty),
    getVisibleTileCount: (pid: number) => wasm.getVisibleTileCount(pid),

    // Map
    getMapSize: () => ({ width: wasm.getMapSize(), height: wasm.getMapSize() }),
    getTileType: (tx: number, ty: number) => wasm.getTileType(tx, ty),
    isPathable: (tx: number, ty: number) => wasm.isPathable(tx, ty),

    // Commands
    issueCommand: (json: string) => wasm.issueCommand(json),

    // Tick control
    getTickMode: () => tickMode,
    setTickMode: (mode: 'realtime' | 'manual') => { tickMode = mode; },
    stepTick: () => { if (manualTickCallback) manualTickCallback(); },
    stepTicks: (n: number) => { for (let i = 0; i < n; i++) { if (manualTickCallback) manualTickCallback(); } },
    fastForward: (n: number) => wasm.fastForward(n),

    // Performance
    getFrameTime: () => {
      if (frameTimes.length === 0) return 0;
      return frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    },
    getTickTime: () => {
      if (tickTimes.length === 0) return 0;
      return tickTimes.reduce((a, b) => a + b, 0) / tickTimes.length;
    },
  };
}

export function recordFrameTime(ms: number) {
  frameTimes.push(ms);
  if (frameTimes.length > 60) frameTimes.shift();
}

export function recordTickTime(ms: number) {
  tickTimes.push(ms);
  if (tickTimes.length > 30) tickTimes.shift();
}

export function getTickMode(): 'realtime' | 'manual' {
  return tickMode;
}
```

- [ ] **Step 2: Wire into main.ts**

In the game loop, check tick mode. In realtime, tick every frame. In manual, only tick when `stepTick` is called via debug API.

- [ ] **Step 3: Commit**

```bash
git add apps/irontide/frontend/src/debug.ts
git commit -m "feat(irontide): window.__IRONTIDE_DEBUG API for agent QA"
```

---

### Task 8: Lobby UI

**Files:**
- Create: `frontend/src/ui/lobby.ts`
- Modify: `frontend/src/main.ts`
- Modify: `frontend/index.html`

- [ ] **Step 1: Create lobby.ts**

Simple vanilla DOM lobby: "Start Local Game" button for V1 (networking is Plan 3).

```typescript
export type LobbyCallback = (action: 'start-local') => void;

export class LobbyUI {
  private el!: HTMLElement;
  private callback!: LobbyCallback;

  init(callback: LobbyCallback) {
    this.el = document.getElementById('lobby')!;
    this.callback = callback;

    this.el.innerHTML = `
      <h1 style="font-size:48px;letter-spacing:4px;margin-bottom:16px;">IRON TIDE</h1>
      <p style="color:#888;margin-bottom:32px;">Browser RTS — Zero Install</p>
      <button id="btn-start-local" style="padding:12px 32px;font-size:18px;cursor:pointer;background:#2a6;color:#fff;border:none;border-radius:4px;">
        Start Local Game
      </button>
      <p id="lobby-status" style="color:#666;margin-top:16px;font-size:13px;">WebGPU required (Chrome, Edge, Safari 18+)</p>
    `;

    document.getElementById('btn-start-local')!.addEventListener('click', () => {
      this.callback('start-local');
    });
  }

  setStatus(msg: string) {
    document.getElementById('lobby-status')!.textContent = msg;
  }

  hide() {
    this.el.classList.add('hidden');
  }

  show() {
    this.el.classList.remove('hidden');
  }
}
```

- [ ] **Step 2: Wire into main.ts**

Show lobby on load. On "Start Local Game", init game, hide lobby, start game loop.

- [ ] **Step 3: Commit**

```bash
git add apps/irontide/frontend/src/ui/lobby.ts
git commit -m "feat(irontide): lobby UI with Start Local Game button"
```

---

## Plan 2 Complete

After all 8 tasks, the frontend should:
- Load WASM engine in the browser
- Render isometric terrain with WebGPU (colored diamonds per tile)
- Render units and buildings as colored rectangles with health bars
- Pan camera with WASD, zoom with scroll wheel
- Select units with left-click, box-select with drag
- Right-click to move, A-click for attack-move, S to stop
- Show HUD: ore count, supply, minimap, command card
- Expose `window.__IRONTIDE_DEBUG` API for QA agent
- Support manual tick mode for deterministic testing

Units are placeholder colored rectangles for now. Sprite art is a separate effort. The game is playable locally with full mechanic interaction.
