/**
 * Lobby UI — shows on load, hides when game starts.
 * Supports both local and networked game modes.
 */

export type LobbyMode = 'menu' | 'creating' | 'waiting' | 'joining' | 'starting';

export class Lobby {
  private el: HTMLElement;
  private statusEl: HTMLElement;
  private startBtn: HTMLElement;

  // Networked UI elements (created dynamically)
  private createRoomBtn: HTMLButtonElement | null = null;
  private joinRoomBtn: HTMLButtonElement | null = null;
  private joinInput: HTMLInputElement | null = null;
  private roomCodeDisplay: HTMLElement | null = null;
  private networkSection: HTMLElement | null = null;

  private onCreateRoomCb: (() => void) | null = null;
  private onJoinRoomCb: ((code: string) => void) | null = null;

  constructor() {
    this.el = document.getElementById('lobby')!;
    this.statusEl = document.getElementById('lobby-status')!;
    this.startBtn = document.getElementById('btn-start-local')!;
    this.buildNetworkUI();
  }

  private buildNetworkUI(): void {
    this.networkSection = document.createElement('div');
    this.networkSection.style.cssText = 'margin-top:24px;display:flex;flex-direction:column;align-items:center;gap:12px;';

    // Divider
    const divider = document.createElement('p');
    divider.textContent = '— or play online —';
    divider.style.cssText = 'color:#555;font-size:13px;margin:0;';
    this.networkSection.appendChild(divider);

    // Create room button
    this.createRoomBtn = document.createElement('button');
    this.createRoomBtn.textContent = 'Create Room';
    this.createRoomBtn.style.cssText = 'padding:10px 28px;font-size:16px;cursor:pointer;background:#26a;color:#fff;border:none;border-radius:4px;';
    this.createRoomBtn.addEventListener('click', () => this.onCreateRoomCb?.());
    this.networkSection.appendChild(this.createRoomBtn);

    // Join room row
    const joinRow = document.createElement('div');
    joinRow.style.cssText = 'display:flex;gap:8px;align-items:center;';

    this.joinInput = document.createElement('input');
    this.joinInput.type = 'text';
    this.joinInput.placeholder = 'Room code';
    this.joinInput.maxLength = 5;
    this.joinInput.style.cssText = 'padding:8px 12px;font-size:16px;width:120px;text-align:center;text-transform:uppercase;background:#222;color:#eee;border:1px solid #444;border-radius:4px;';

    this.joinRoomBtn = document.createElement('button');
    this.joinRoomBtn.textContent = 'Join';
    this.joinRoomBtn.style.cssText = 'padding:8px 20px;font-size:16px;cursor:pointer;background:#a62;color:#fff;border:none;border-radius:4px;';
    this.joinRoomBtn.addEventListener('click', () => {
      const code = this.joinInput?.value.trim();
      if (code) this.onJoinRoomCb?.(code);
    });

    joinRow.appendChild(this.joinInput);
    joinRow.appendChild(this.joinRoomBtn);
    this.networkSection.appendChild(joinRow);

    // Room code display (hidden initially)
    this.roomCodeDisplay = document.createElement('div');
    this.roomCodeDisplay.style.cssText = 'display:none;text-align:center;';
    this.networkSection.appendChild(this.roomCodeDisplay);

    // Insert after the start button
    this.startBtn.parentElement!.insertBefore(
      this.networkSection,
      this.statusEl,
    );
  }

  setStatus(text: string): void {
    this.statusEl.textContent = text;
  }

  onStart(callback: () => void): void {
    this.startBtn.addEventListener('click', callback);
  }

  onCreateRoom(callback: () => void): void {
    this.onCreateRoomCb = callback;
  }

  onJoinRoom(callback: (code: string) => void): void {
    this.onJoinRoomCb = callback;
  }

  /**
   * Show room code and waiting state after room creation.
   */
  showRoomCode(code: string): void {
    if (this.roomCodeDisplay) {
      this.roomCodeDisplay.style.display = 'block';
      this.roomCodeDisplay.innerHTML = `
        <p style="color:#888;font-size:13px;margin-bottom:8px;">Share this code with your opponent:</p>
        <p style="font-size:36px;letter-spacing:8px;font-weight:bold;color:#4af;">${code}</p>
        <p style="color:#666;font-size:13px;margin-top:8px;">Waiting for player 2...</p>
      `;
    }
    // Hide create/join controls while waiting
    if (this.createRoomBtn) this.createRoomBtn.style.display = 'none';
    if (this.joinInput) this.joinInput.parentElement!.style.display = 'none';
    this.startBtn.style.display = 'none';
  }

  /**
   * Show joining state.
   */
  showJoining(): void {
    this.setStatus('Joining room...');
    if (this.createRoomBtn) this.createRoomBtn.style.display = 'none';
    if (this.joinInput) this.joinInput.parentElement!.style.display = 'none';
    this.startBtn.style.display = 'none';
  }

  hide(): void {
    this.el.classList.add('hidden');
  }

  show(): void {
    this.el.classList.remove('hidden');
  }
}
