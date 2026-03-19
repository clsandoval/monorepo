import { useRef, useEffect, useCallback } from 'react';
import { Application } from 'pixi.js';
import type { Unit, Board as BoardType } from '../engine/types';
import { createBoardGraphics, getTileSize } from './create-board';
import { renderUnits } from './render-units';

type BoardProps = {
  board: BoardType;
  units: Unit[];
  ghostOpacity?: number;
  onClick?: (x: number, y: number) => void;
};

export function Board({ board, units, ghostOpacity = 1, onClick }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  const TILE = getTileSize();
  const PADDING = 30;
  const canvasWidth = board.width * TILE + PADDING * 2;
  const canvasHeight = board.height * TILE + PADDING * 2;

  // Init Pixi app
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const app = new Application();
    let cancelled = false;

    app.init({
      width: canvasWidth,
      height: canvasHeight,
      background: 0x091833,
      antialias: true,
    }).then(() => {
      if (cancelled) {
        app.destroy();
        return;
      }
      appRef.current = app;
      el.appendChild(app.canvas);
      renderAll();
    });

    return () => {
      cancelled = true;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderAll = useCallback(() => {
    const app = appRef.current;
    if (!app) return;

    // Clear stage
    while (app.stage.children.length > 0) {
      app.stage.removeChildAt(0);
    }

    // Board grid
    const boardGfx = createBoardGraphics(board);
    boardGfx.x = PADDING;
    boardGfx.y = PADDING;
    app.stage.addChild(boardGfx);

    // Units
    const unitGfx = renderUnits(units, ghostOpacity);
    unitGfx.x = PADDING;
    unitGfx.y = PADDING;
    app.stage.addChild(unitGfx);
  }, [board, units, ghostOpacity, PADDING]);

  // Re-render when units or board change
  useEffect(() => {
    renderAll();
  }, [renderAll]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClick) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = e.clientX - rect.left - PADDING;
      const py = e.clientY - rect.top - PADDING;
      const x = Math.floor(px / TILE);
      const y = Math.floor(py / TILE);
      if (x >= 0 && x < board.width && y >= 0 && y < board.height) {
        onClick(x, y);
      }
    },
    [onClick, TILE, PADDING, board.width, board.height],
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ width: canvasWidth, height: canvasHeight, cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}
