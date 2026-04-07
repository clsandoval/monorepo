/**
 * WebSocket client for Iron Tide relay server.
 */

import type { ServerMessage, ClientMessage } from './protocol.js';

export type MessageHandler = (msg: ServerMessage) => void;

export class NetClient {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];

  /**
   * Open a WebSocket connection to the relay server.
   */
  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        this.ws = ws;
        resolve();
      };

      ws.onerror = (ev) => {
        reject(new Error(`WebSocket connection failed: ${ev}`));
      };

      ws.onmessage = (ev) => {
        try {
          const msg: ServerMessage = JSON.parse(ev.data as string);
          for (const handler of this.handlers) {
            handler(msg);
          }
        } catch (e) {
          console.error('[NetClient] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        console.log('[NetClient] Connection closed');
        this.ws = null;
      };
    });
  }

  /**
   * Register a handler for incoming server messages.
   */
  onMessage(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Send a raw message object (JSON-stringified).
   */
  send(msg: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[NetClient] Not connected, cannot send');
      return;
    }
    this.ws.send(JSON.stringify(msg));
  }

  /**
   * Request room creation.
   */
  createRoom(): void {
    this.send({ type: 'CreateRoom' });
  }

  /**
   * Join an existing room by code.
   */
  joinRoom(code: string): void {
    this.send({ type: 'JoinRoom', room_code: code.toUpperCase() });
  }

  /**
   * Send game commands for a tick.
   */
  sendCommands(tick: number, commandsJson: string, checksum: string | null): void {
    this.send({ type: 'GameCommands', tick, commands_json: commandsJson, checksum });
  }

  /**
   * Close the connection.
   */
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers = [];
  }

  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
