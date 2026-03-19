import { create } from 'zustand';
import type { GameState, GamePhase, SignalType } from '../engine/types';
import { executeTick } from '../engine/tick';
import { createMission1 } from '../engine/mission1';

type GameStore = GameState & {
  initMission1: () => void;
  setPhase: (phase: GamePhase) => void;
  runTick: () => void;
  inspectorTick: number;
  setInspectorTick: (tick: number) => void;
  toggleListenFilter: (unitId: string, signalType: SignalType) => void;
  removeNoiseEntry: (unitId: string, slotIndex: number) => void;
  speed: number;
  setSpeed: (speed: number) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'plan',
  board: { width: 6, height: 6, tiles: [] },
  units: [],
  currentTick: 0,
  tickHistory: [],
  missionComplete: false,
  missionResult: 'pending',
  inspectorTick: 0,
  speed: 1,

  initMission1: () => {
    const state = createMission1();
    set({ ...state });
  },

  setPhase: (phase) => set({ phase }),

  runTick: () => {
    const state = get();
    const next = executeTick(state);
    set({
      units: next.units,
      currentTick: next.currentTick,
      tickHistory: next.tickHistory,
      missionComplete: next.missionComplete,
      missionResult: next.missionResult,
    });
  },

  setInspectorTick: (tick) => set({ inspectorTick: tick }),

  toggleListenFilter: (unitId, signalType) => {
    set(state => ({
      units: state.units.map(u => {
        if (u.id !== unitId) return u;
        const filter = new Set(u.buffer.listenFilter);
        if (filter.has(signalType)) filter.delete(signalType);
        else filter.add(signalType);
        return { ...u, buffer: { ...u.buffer, listenFilter: filter } };
      }),
    }));
  },

  removeNoiseEntry: (unitId, slotIndex) => {
    set(state => ({
      units: state.units.map(u => {
        if (u.id !== unitId) return u;
        const slots = [...u.buffer.slots];
        slots[slotIndex] = null;
        const isFull = slots.every(s => s !== null);
        return { ...u, buffer: { ...u.buffer, slots }, stunned: isFull };
      }),
    }));
  },

  setSpeed: (speed) => set({ speed }),
}));
