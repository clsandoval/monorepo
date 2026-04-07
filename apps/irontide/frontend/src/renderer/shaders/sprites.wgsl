// Sprite instanced shader — colored rectangles with health bars
// Per-instance data (32 bytes):
//   screen_pos (vec2<f32>), size (vec2<f32>), color (vec3<f32>), health (f32)

struct Uniforms {
  resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
  @builtin(vertex_index) vi: u32,
  @location(0) screen_pos: vec2<f32>,
  @location(1) size: vec2<f32>,
  @location(2) color: vec3<f32>,
  @location(3) health: f32,
};

struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) color: vec3<f32>,
  @location(2) health: f32,
};

// 6 vertices forming a quad (2 triangles)
// UV coords: (0,0) top-left, (1,1) bottom-right

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var uv_offsets = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0),  // TL
    vec2<f32>(1.0, 0.0),  // TR
    vec2<f32>(0.0, 1.0),  // BL
    vec2<f32>(1.0, 0.0),  // TR
    vec2<f32>(1.0, 1.0),  // BR
    vec2<f32>(0.0, 1.0),  // BL
  );

  let uv = uv_offsets[input.vi];
  // Center the quad on screen_pos
  let pixel_pos = input.screen_pos + (uv - vec2<f32>(0.5, 1.0)) * input.size;

  let clip_x = (pixel_pos.x / uniforms.resolution.x) * 2.0 - 1.0;
  let clip_y = 1.0 - (pixel_pos.y / uniforms.resolution.y) * 2.0;

  var output: VertexOutput;
  output.pos = vec4<f32>(clip_x, clip_y, 0.0, 1.0);
  output.uv = uv;
  output.color = input.color;
  output.health = input.health;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let uv = input.uv;

  // Health bar region: top 15% of the sprite
  let bar_height = 0.12;
  if (uv.y < bar_height) {
    // Health bar
    let bar_u = uv.x;
    if (bar_u <= input.health) {
      // Filled portion: green to red gradient based on health
      let r = 1.0 - input.health;
      let g = input.health;
      return vec4<f32>(r, g, 0.1, 1.0);
    } else {
      // Missing health: dark gray
      return vec4<f32>(0.2, 0.2, 0.2, 1.0);
    }
  }

  // Body: team-colored rectangle with slight border
  let border = 0.06;
  if (uv.x < border || uv.x > 1.0 - border || uv.y < bar_height + border || uv.y > 1.0 - border) {
    // Darker border
    return vec4<f32>(input.color * 0.4, 1.0);
  }

  return vec4<f32>(input.color, 1.0);
}
