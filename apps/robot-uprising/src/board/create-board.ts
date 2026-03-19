import { Graphics, Text, Container, TextStyle } from 'pixi.js';
import type { Board } from '../engine/types';

const TILE_SIZE = 64;
const DARK_A = 0x1a1a2e;
const DARK_B = 0x16213e;
const OBJECTIVE_TINT = 0x0a3a4a;
const GRID_LINE = 0x2a3a5e;
const LABEL_COLOR = '#5a7a9a';

export function getTileSize(): number {
  return TILE_SIZE;
}

export function createBoardGraphics(board: Board): Container {
  const container = new Container();
  const { width, height, tiles } = board;

  // Draw tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tiles[y]?.[x];
      const isObjective = tile?.type === 'objective';
      const isCheckerDark = (x + y) % 2 === 0;

      const g = new Graphics();
      let color: number;
      if (isObjective) {
        color = OBJECTIVE_TINT;
      } else {
        color = isCheckerDark ? DARK_A : DARK_B;
      }

      g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      g.fill(color);

      // Grid line
      g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      g.stroke({ width: 1, color: GRID_LINE, alpha: 0.4 });

      // Objective marker
      if (isObjective) {
        g.rect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        g.stroke({ width: 2, color: 0x00ccff, alpha: 0.6 });
      }

      container.addChild(g);
    }
  }

  // Axis labels
  const labelStyle = new TextStyle({
    fontFamily: 'monospace',
    fontSize: 12,
    fill: LABEL_COLOR,
  });

  for (let x = 0; x < width; x++) {
    const label = new Text({
      text: String.fromCharCode(65 + x),
      style: labelStyle,
    });
    label.x = x * TILE_SIZE + TILE_SIZE / 2 - 4;
    label.y = -18;
    container.addChild(label);
  }

  for (let y = 0; y < height; y++) {
    const label = new Text({
      text: String(y + 1),
      style: labelStyle,
    });
    label.x = -18;
    label.y = y * TILE_SIZE + TILE_SIZE / 2 - 6;
    container.addChild(label);
  }

  return container;
}
