import { useState, useMemo } from 'react';
import { useGameStore } from '../store/game-store';
import { Board } from '../board/Board';
import type { Unit, TickEvent, BufferEntry } from '../engine/types';

const SIGNAL_COLORS: Record<string, string> = {
  threat: '#ff4444',
  position: '#44aaff',
  terrain: '#66cc66',
  comms: '#cc88ff',
  noise: '#888888',
};

function formatEvent(ev: TickEvent): string {
  switch (ev.type) {
    case 'perceive':
      return `[perceive] ${ev.unitId}: ${ev.entry.type} "${ev.entry.value}"`;
    case 'act':
      return `[act] ${ev.unitId}: ${ev.action.type} — ${ev.reason}`;
    case 'combat':
      return `[combat] ${ev.attackerId} → ${ev.targetId}`;
    case 'buffer_full':
      return `[buffer_full] ${ev.unitId}`;
    case 'overload':
      return `[overload] ${ev.unitId}`;
    case 'move':
      return `[move] ${ev.unitId}: (${ev.from.x},${ev.from.y}) → (${ev.to.x},${ev.to.y})`;
    case 'objective_reached':
      return `[objective] ${ev.unitId} reached objective!`;
    case 'noise':
      return `[noise] ${ev.unitId}: "${ev.entry.value}"`;
    default:
      return `[${(ev as TickEvent).type}]`;
  }
}

function SlotView({ slot, index }: { slot: BufferEntry | null; index: number }) {
  if (!slot) {
    return (
      <div style={{ padding: '2px 6px', color: '#333', fontSize: 12 }}>
        [{index}] — empty —
      </div>
    );
  }
  return (
    <div style={{ padding: '2px 6px', fontSize: 12 }}>
      <span style={{ color: '#5a7a9a' }}>[{index}]</span>{' '}
      <span style={{ color: SIGNAL_COLORS[slot.type] || '#888' }}>{slot.type}</span>{' '}
      <span style={{ color: '#c0d0e0' }}>"{slot.value}"</span>{' '}
      <span style={{ color: '#5a7a9a' }}>age={slot.age}</span>
    </div>
  );
}

export function Inspector() {
  const {
    board,
    tickHistory,
    missionResult,
    inspectorTick,
    setInspectorTick,
    initMission1,
    setPhase,
  } = useGameStore();

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const currentState = tickHistory[inspectorTick] ?? null;
  const displayUnits: Unit[] = currentState?.units ?? [];
  const events: TickEvent[] = currentState?.events ?? [];

  const selectedUnit = useMemo(
    () => (selectedUnitId ? displayUnits.find(u => u.id === selectedUnitId) ?? null : null),
    [displayUnits, selectedUnitId],
  );

  const unitEvents = useMemo(
    () =>
      selectedUnitId
        ? events.filter(ev => {
            if ('unitId' in ev) return ev.unitId === selectedUnitId;
            if ('attackerId' in ev) return ev.attackerId === selectedUnitId || ev.targetId === selectedUnitId;
            return false;
          })
        : [],
    [events, selectedUnitId],
  );

  const handleBoardClick = (x: number, y: number) => {
    const unit = displayUnits.find(u => u.position.x === x && u.position.y === y);
    setSelectedUnitId(unit?.id ?? null);
  };

  const handleRedesign = () => {
    initMission1();
    setPhase('plan');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#091833',
      color: '#c0d0e0',
      fontFamily: 'monospace',
    }}>
      {/* Left: Board + Timeline */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
      }}>
        {/* Result badge */}
        <div style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: missionResult === 'victory' ? '#00ccff' : '#ff4444',
          marginBottom: 8,
          letterSpacing: 4,
        }}>
          {missionResult === 'victory' ? 'VICTORY' : 'DEFEAT'}
        </div>

        {/* Timeline scrubber */}
        <div style={{ width: '100%', maxWidth: 500, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5a7a9a' }}>
            <span>Tick {inspectorTick}</span>
            <span>{tickHistory.length - 1} total</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, tickHistory.length - 1)}
            value={inspectorTick}
            onChange={e => setInspectorTick(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00ccff' }}
          />
        </div>

        {/* Board */}
        <Board board={board} units={displayUnits} onClick={handleBoardClick} />

        {/* Redesign button */}
        <button
          onClick={handleRedesign}
          style={{
            marginTop: 16,
            padding: '10px 28px',
            background: '#1a2a3a',
            color: '#00ccff',
            border: '1px solid #00ccff44',
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'monospace',
            cursor: 'pointer',
            letterSpacing: 2,
          }}
        >
          REDESIGN
        </button>
      </div>

      {/* Right: Sidebar */}
      <div style={{
        flex: 1,
        padding: 24,
        overflowY: 'auto',
        borderLeft: '1px solid #1a3a5a',
      }}>
        {/* Selected unit detail */}
        {selectedUnit ? (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: '#00ccff', fontSize: 16, margin: '0 0 8px 0' }}>
              {selectedUnit.id} ({selectedUnit.type})
              {selectedUnit.stunned && <span style={{ color: '#ff4444' }}> STUNNED</span>}
            </h2>

            <div style={{ color: '#5a7a9a', fontSize: 11, marginBottom: 4 }}>BUFFER STATE</div>
            <div style={{
              background: '#0d1b2a',
              border: '1px solid #1a3a5a',
              borderRadius: 4,
              padding: 8,
              marginBottom: 12,
            }}>
              {selectedUnit.buffer.slots.map((slot, i) => (
                <SlotView key={i} slot={slot} index={i} />
              ))}
            </div>

            <div style={{ color: '#5a7a9a', fontSize: 11, marginBottom: 4 }}>DECISION TRACE</div>
            <div style={{
              background: '#0d1b2a',
              border: '1px solid #1a3a5a',
              borderRadius: 4,
              padding: 8,
            }}>
              {unitEvents.length === 0 ? (
                <div style={{ color: '#333', fontSize: 12 }}>No events this tick</div>
              ) : (
                unitEvents.map((ev, i) => (
                  <div key={i} style={{ fontSize: 12, padding: '2px 0', color: '#aabbcc' }}>
                    {formatEvent(ev)}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div style={{ color: '#5a7a9a', fontSize: 13, marginBottom: 24 }}>
            Click a unit on the board to inspect its state.
          </div>
        )}

        {/* All events at current tick */}
        <div>
          <h3 style={{ color: '#5a7a9a', fontSize: 13, margin: '0 0 8px 0' }}>
            EVENT LOG — Tick {inspectorTick}
          </h3>
          <div style={{
            background: '#0d1b2a',
            border: '1px solid #1a3a5a',
            borderRadius: 4,
            padding: 8,
            maxHeight: 300,
            overflowY: 'auto',
          }}>
            {events.length === 0 ? (
              <div style={{ color: '#333', fontSize: 12 }}>No events</div>
            ) : (
              events.map((ev, i) => (
                <div key={i} style={{ fontSize: 12, padding: '2px 0', color: '#8899aa' }}>
                  {formatEvent(ev)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
