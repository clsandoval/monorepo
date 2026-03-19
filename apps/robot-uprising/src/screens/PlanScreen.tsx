import { useGameStore } from '../store/game-store';
import { Board } from '../board/Board';
import { ContextConfigPanel } from './ContextConfigPanel';

export function PlanScreen() {
  const { board, units, setPhase } = useGameStore();
  const playerUnits = units.filter(u => u.team === 'player');

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#091833',
      color: '#c0d0e0',
      fontFamily: 'monospace',
    }}>
      {/* Board — left 50% */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Board board={board} units={units} />
      </div>

      {/* Workbench — right 50% */}
      <div style={{
        flex: 1,
        padding: 24,
        overflowY: 'auto',
        borderLeft: '1px solid #1a3a5a',
      }}>
        <h1 style={{ color: '#00ccff', fontSize: 20, margin: '0 0 4px 0' }}>
          Mission 1: Wake Up
        </h1>
        <p style={{ color: '#5a7a9a', fontSize: 13, margin: '0 0 20px 0' }}>
          Clear noise from your units' context buffers so they can act.
        </p>

        {playerUnits.map(unit => (
          <ContextConfigPanel key={unit.id} unit={unit} />
        ))}

        <button
          onClick={() => setPhase('watch')}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '12px 24px',
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
          EXECUTE
        </button>
      </div>
    </div>
  );
}
