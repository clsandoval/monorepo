/**
 * Lobby UI — shows on load, hides when game starts.
 */

export class Lobby {
  private el: HTMLElement;
  private statusEl: HTMLElement;
  private startBtn: HTMLElement;

  constructor() {
    this.el = document.getElementById('lobby')!;
    this.statusEl = document.getElementById('lobby-status')!;
    this.startBtn = document.getElementById('btn-start-local')!;
  }

  setStatus(text: string): void {
    this.statusEl.textContent = text;
  }

  onStart(callback: () => void): void {
    this.startBtn.addEventListener('click', callback);
  }

  hide(): void {
    this.el.classList.add('hidden');
  }

  show(): void {
    this.el.classList.remove('hidden');
  }
}
