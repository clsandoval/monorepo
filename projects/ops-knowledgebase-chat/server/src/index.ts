import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadRouter } from './upload.js';
import { MessageStream, runAgent, type AgentSession } from './agent.js';
import type { ClientMessage } from './protocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
const server = createServer(app);

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

app.use(uploadRouter);

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('[ws] Client connected');

  let session: AgentSession = {
    stream: new MessageStream(),
    generator: null,
  };
  let agentRunning = false;

  async function startAgent() {
    if (agentRunning) return;
    agentRunning = true;

    try {
      for await (const msg of runAgent(session)) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[ws] Agent error:', message);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message }));
      }
    } finally {
      agentRunning = false;
    }
  }

  ws.on('message', (data: Buffer) => {
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(data.toString()) as ClientMessage;
    } catch {
      return;
    }

    switch (parsed.type) {
      case 'user_message':
        session.stream.push(parsed.content);
        if (!agentRunning) {
          startAgent();
        }
        break;

      case 'interrupt':
        if (session.generator) {
          session.generator.return(undefined);
          session.generator = null;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'done' }));
          }
        }
        break;

      case 'new_session':
        session.stream.end();
        if (session.generator) {
          session.generator.return(undefined);
        }
        session = {
          stream: new MessageStream(),
          generator: null,
        };
        agentRunning = false;
        console.log('[ws] New session started');
        break;
    }
  });

  ws.on('close', () => {
    console.log('[ws] Client disconnected');
    session.stream.end();
    if (session.generator) {
      session.generator.return(undefined);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
