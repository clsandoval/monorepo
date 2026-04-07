// Terrain tile instanced shader
// Each instance: screen_pos (vec2<f32>), tile_type (f32), fog_state (f32)

struct Uniforms {
  resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
  @builtin(vertex_index) vi: u32,
  // Per-instance data
  @location(0) screen_pos: vec2<f32>,
  @location(1) tile_type: f32,
  @location(2) fog_state: f32,
};

struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  @location(0) tile_type: f32,
  @location(1) fog_state: f32,
};

const TILE_W: f32 = 64.0;
const TILE_H: f32 = 32.0;

// Diamond shape: 6 vertices (2 triangles)
// Vertices of diamond: top(0,-h/2), right(w/2,0), bottom(0,h/2), left(-w/2,0)
// Triangle 1: top, right, bottom
// Triangle 2: top, bottom, left

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var offsets = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -TILE_H / 2.0),   // top
    vec2<f32>(TILE_W / 2.0, 0.0),    // right
    vec2<f32>(0.0, TILE_H / 2.0),    // bottom
    vec2<f32>(0.0, -TILE_H / 2.0),   // top
    vec2<f32>(0.0, TILE_H / 2.0),    // bottom
    vec2<f32>(-TILE_W / 2.0, 0.0),   // left
  );

  let pixel_pos = input.screen_pos + offsets[input.vi];

  // Convert pixel coords to clip space: [-1, 1]
  let clip_x = (pixel_pos.x / uniforms.resolution.x) * 2.0 - 1.0;
  let clip_y = 1.0 - (pixel_pos.y / uniforms.resolution.y) * 2.0;

  var output: VertexOutput;
  output.pos = vec4<f32>(clip_x, clip_y, 0.0, 1.0);
  output.tile_type = input.tile_type;
  output.fog_state = input.fog_state;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  // Base color by tile type
  var color: vec3<f32>;
  let t = u32(input.tile_type);
  if (t == 0u) {
    color = vec3<f32>(0.3, 0.6, 0.2);   // grass — green
  } else if (t == 1u) {
    color = vec3<f32>(0.2, 0.35, 0.65);  // water — blue
  } else if (t == 2u) {
    color = vec3<f32>(0.45, 0.42, 0.4);  // rock — gray
  } else {
    color = vec3<f32>(0.75, 0.65, 0.2);  // ore/resource — gold
  }

  // Fog of war
  let fog = u32(input.fog_state);
  if (fog == 0u) {
    // Unexplored — near-black
    color = color * 0.08;
  } else if (fog == 1u) {
    // Fog — 40% brightness
    color = color * 0.4;
  }
  // fog == 2: visible — full color

  return vec4<f32>(color, 1.0);
}
