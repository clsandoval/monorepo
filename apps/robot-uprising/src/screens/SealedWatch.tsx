import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game-store';
import { Board } from '../board/Board';

const MAX_TICKS = 60;

export function SealedWatch() {
  const { board, units, currentTick, missionComplete, missionResult, speed, setSpeed, setPhase } =
    useGameStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (missionComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const ms = 600 / speed;
    intervalRef.current = setInterval(() => {
      const state = useGameStore.getState();
      if (state.missionComplete || state.currentTick >= MAX_TICKS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      state.runTick();
    }, ms);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed, missionComplete]);

  // Tick pips
  const pips = [];
  for (let i = 0; i < MAX_TICKS; i++) {
    pips.push(
      <div
        key={i}
        style={{
          width: 8,
          height: 16,
          borderRadius: 2,
          background: i < currentTick ? '#ccaa22' : '#1a2a3a',
          border: i === currentTick ? '1px solid #ffcc44' : '1px solid #0d1b2a',
        }}
      />,
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#091833',
      color: '#c0d0e0',
      fontFamily: 'monospace',
    }}>
      {/* Tick clock */}
      <div style={{
        display: 'flex',
        gap: 2,
        padding: '16px 24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '90vw',
      }}>
        {pips}
      </div>

      <div style={{ fontSize: 13, color: '#5a7a9a', marginBottom: 8 }}>
        TICK {currentTick} / {MAX_TICKS}
      </div>

      {/* Speed controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[0.5, 1, 2].map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              padding: '4px 14px',
              background: speed === s ? '#00ccff' : '#1a2a3a',
              color: speed === s ? '#091833' : '#5a7a9a',
              border: speed === s ? '1px solid #00ccff' : '1px solid #1a3a5a',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: speed === s ? 'bold' : 'normal',
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Board */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Board board={board} units={units} />
      </div>

      {/* Result overlay */}
      {missionComplete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(9, 24, 51, 0.85)',
          zIndex: 10,
        }}>
          <div style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: missionResult === 'victory' ? '#00ccff' : '#ff4444',
            marginBottom: 24,
            letterSpacing: 6,
          }}>
            {missionResult === 'victory' ? 'VICTORY' : 'DEFEAT'}
          </div>
          <button
            onClick={() => setPhase('inspect')}
            style={{
              padding: '12px 32px',
              background: '#00ccff',
              color: '#091833',
              border: 'none',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              cursor: 'pointer',
              letterSpacing: 2,
            }}
          >
            INSPECT
          </button>
        </div>
      )}
    </div>
  );
}
