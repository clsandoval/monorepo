import type { GameState } from './types';
import { executeTick } from './tick';

export type GameLoopCallbacks = {
  onTick: (state: GameState) => void;
  onComplete: (state: GameState) => void;
};

export class GameLoop {
  private state: GameState;
  private callbacks: GameLoopCallbacks;
  private running = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private speed = 1;

  constructor(initialState: GameState, callbacks: GameLoopCallbacks) {
    this.state = initialState;
    this.callbacks = callbacks;
  }

  start() { this.running = true; this.scheduleTick(); }
  stop() { this.running = false; if (this.timeoutId) clearTimeout(this.timeoutId); }
  setSpeed(speed: number) { this.speed = speed; }
  getState(): GameState { return this.state; }

  private scheduleTick() {
    if (!this.running) return;
    this.timeoutId = setTimeout(() => this.tick(), 1000 / this.speed);
  }

  private tick() {
    this.state = executeTick(this.state);
    this.callbacks.onTick(this.state);
    if (this.state.missionComplete) {
      this.running = false;
      this.callbacks.onComplete(this.state);
      return;
    }
    this.scheduleTick();
  }
}
