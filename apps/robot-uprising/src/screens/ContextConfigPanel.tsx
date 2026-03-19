import { useGameStore } from '../store/game-store';
import type { Unit, SignalType } from '../engine/types';
import { getOccupied } from '../engine/buffer';

const SIGNAL_TYPES: SignalType[] = ['threat', 'position', 'terrain', 'comms', 'noise'];

const SIGNAL_COLORS: Record<SignalType, string> = {
  threat: '#ff4444',
  position: '#44aaff',
  terrain: '#66cc66',
  comms: '#cc88ff',
  noise: '#888888',
};

type Props = { unit: Unit };

export function ContextConfigPanel({ unit }: Props) {
  const removeNoiseEntry = useGameStore(s => s.removeNoiseEntry);
  const toggleListenFilter = useGameStore(s => s.toggleListenFilter);

  const filled = getOccupied(unit.buffer).length;

  return (
    <div style={{
      background: '#0d1b2a',
      border: '1px solid #1a3a5a',
      borderRadius: 6,
      padding: 12,
      marginBottom: 12,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#00ccff',
      }}>
        <span>{unit.id} ({unit.type})</span>
        <span style={{ color: filled === unit.buffer.capacity ? '#ff4444' : '#66cc66' }}>
          {filled}/{unit.buffer.capacity} slots
        </span>
      </div>

      {/* Buffer slots */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#5a7a9a', fontSize: 11, marginBottom: 4 }}>BUFFER CONTENTS</div>
        {unit.buffer.slots.map((slot, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 6px',
            marginBottom: 2,
            background: slot ? '#111d2e' : '#0a1420',
            borderRadius: 3,
            fontSize: 13,
          }}>
            {slot ? (
              <>
                <span style={{ color: SIGNAL_COLORS[slot.type] }}>
                  [{slot.type}] {slot.value}
                </span>
                {slot.type === 'noise' && (
                  <button
                    onClick={() => removeNoiseEntry(unit.id, i)}
                    style={{
                      background: '#2a1a1a',
                      color: '#ff6666',
                      border: '1px solid #552222',
                      borderRadius: 3,
                      padding: '1px 8px',
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    Remove
                  </button>
                )}
              </>
            ) : (
              <span style={{ color: '#333' }}>— empty —</span>
            )}
          </div>
        ))}
      </div>

      {/* Listen filter toggles */}
      <div>
        <div style={{ color: '#5a7a9a', fontSize: 11, marginBottom: 4 }}>LISTEN FILTER</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SIGNAL_TYPES.map(st => {
            const isListening = unit.buffer.listenFilter.has(st);
            return (
              <button
                key={st}
                onClick={() => toggleListenFilter(unit.id, st)}
                style={{
                  background: isListening ? '#1a2a3a' : '#0a0a14',
                  color: isListening ? SIGNAL_COLORS[st] : '#444',
                  border: `1px solid ${isListening ? SIGNAL_COLORS[st] + '66' : '#222'}`,
                  borderRadius: 3,
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                {isListening ? 'LISTEN' : 'IGNORE'} {st}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
