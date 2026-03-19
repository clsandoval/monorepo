import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Unit, UnitType } from '../engine/types';
import { getFillRatio } from '../engine/buffer';
import { getTileSize } from './create-board';

const UNIT_EMOJI: Record<UnitType, string> = {
  scout: '\u{1F441}',      // 👁
  striker: '\u2694',         // ⚔
  relay: '\u{1F4E1}',       // 📡
  specialist: '\u{1F527}',  // 🔧
  command: '\u{1F916}',     // 🤖
};

const TEAM_COLORS = {
  player: 0x00ccff,
  enemy: 0xff4444,
} as const;

function getBufferBarColor(ratio: number): number {
  if (ratio < 0.5) return 0x44cc44;  // green
  if (ratio < 0.8) return 0xccaa22;  // amber
  return 0xcc4444;                    // red
}

export function renderUnits(units: Unit[], ghostOpacity = 1): Container {
  const container = new Container();
  const TILE = getTileSize();

  for (const unit of units) {
    if (!unit.alive) continue;

    const group = new Container();
    group.x = unit.position.x * TILE;
    group.y = unit.position.y * TILE;
    group.alpha = ghostOpacity;

    // Team color border
    const border = new Graphics();
    border.rect(2, 2, TILE - 4, TILE - 4);
    border.stroke({ width: 2, color: TEAM_COLORS[unit.team], alpha: 0.8 });
    group.addChild(border);

    // Stunned jitter effect — offset the icon slightly
    const jitterX = unit.stunned ? (Math.random() - 0.5) * 4 : 0;
    const jitterY = unit.stunned ? (Math.random() - 0.5) * 4 : 0;

    // Stunned overlay
    if (unit.stunned) {
      const stunOverlay = new Graphics();
      stunOverlay.rect(2, 2, TILE - 4, TILE - 4);
      stunOverlay.fill({ color: 0xff0000, alpha: 0.15 });
      group.addChild(stunOverlay);
    }

    // Emoji icon
    const emoji = new Text({
      text: UNIT_EMOJI[unit.type],
      style: new TextStyle({ fontSize: 28 }),
    });
    emoji.x = TILE / 2 - 14 + jitterX;
    emoji.y = TILE / 2 - 20 + jitterY;
    group.addChild(emoji);

    // Buffer fill bar at bottom
    const fillRatio = getFillRatio(unit.buffer);
    const barWidth = TILE - 8;
    const barHeight = 6;
    const barX = 4;
    const barY = TILE - 10;

    // Bar background
    const barBg = new Graphics();
    barBg.rect(barX, barY, barWidth, barHeight);
    barBg.fill({ color: 0x000000, alpha: 0.5 });
    group.addChild(barBg);

    // Bar fill
    if (fillRatio > 0) {
      const barFill = new Graphics();
      barFill.rect(barX, barY, barWidth * fillRatio, barHeight);
      barFill.fill(getBufferBarColor(fillRatio));
      group.addChild(barFill);
    }

    container.addChild(group);
  }

  return container;
}
