import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadRouter } from './upload.js';
import { filesRouter } from './files.js';
import { sessionsRouter, createSession, loadSession, appendMessages, updateTitle, generateTitle } from './sessions.js';
import { MessageStream, runAgent, type AgentSession } from './agent.js';
import type { ClientMessage, SessionMessage } from './protocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
const server = createServer(app);

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// API routers — must be before static/catch-all
app.use(uploadRouter);
app.use(filesRouter);
app.use(sessionsRouter);

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
  let activeSessionDataId: string | null = null;
  let pendingMessages: SessionMessage[] = [];
  let firstMessageContent: string | null = null;
  let titleGenerated = false;

  function resetSession() {
    session.stream.end();
    if (session.generator) {
      session.generator.return(undefined);
    }
    session = {
      stream: new MessageStream(),
      generator: null,
    };
    agentRunning = false;
    activeSessionDataId = null;
    pendingMessages = [];
    firstMessageContent = null;
    titleGenerated = false;
  }

  async function startAgent() {
    if (agentRunning) return;
    agentRunning = true;

    try {
      for await (const msg of runAgent(session)) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }

        // Collect messages for persistence
        if (msg.type === 'assistant_text') {
          pendingMessages.push({
            role: 'assistant',
            content: msg.content,
            timestamp: new Date().toISOString(),
          });
        }

        if (msg.type === 'done' && activeSessionDataId) {
          // Save pending messages
          appendMessages(activeSessionDataId, pendingMessages, session.sessionId, session.lastAssistantUuid);
          pendingMessages = [];

          // Generate title after first turn
          if (!titleGenerated && firstMessageContent) {
            titleGenerated = true;
            generateTitle(firstMessageContent).then((title) => {
              if (activeSessionDataId) {
                updateTitle(activeSessionDataId, title);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'session_title', title }));
                }
              }
            });
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[ws] Agent error:', message);

      // If session resume failed, retry without resume (fresh session)
      if (message.includes('no message found with message.uuid') || message.includes('resume')) {
        console.log('[ws] Session resume failed, retrying with fresh session');
        session.sessionId = undefined;
        session.lastAssistantUuid = undefined;
        session.stream = new MessageStream();
        session.generator = null;
        agentRunning = false;
        // Re-push the last user message if we have one
        if (firstMessageContent) {
          session.stream.push(firstMessageContent);
          startAgent();
        }
        return;
      }

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
      case 'user_message': {
        // Create session on first message if none active
        if (!activeSessionDataId) {
          const sessionData = createSession();
          activeSessionDataId = sessionData.id;
          firstMessageContent = parsed.content;
        }

        // Save user message immediately
        appendMessages(activeSessionDataId, [{
          role: 'user',
          content: parsed.content,
          timestamp: new Date().toISOString(),
        }]);

        session.stream.push(parsed.content);
        if (!agentRunning) {
          startAgent();
        }
        break;
      }

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
        resetSession();
        console.log('[ws] New session started');
        break;

      case 'load_session': {
        // End current session
        resetSession();

        const sessionData = loadSession(parsed.session_id);
        if (!sessionData) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
          }
          break;
        }

        // Set up for resume
        activeSessionDataId = sessionData.id;
        titleGenerated = !!sessionData.title && sessionData.title !== 'New conversation';
        firstMessageContent = sessionData.messages.find((m) => m.role === 'user')?.content || null;

        // Prepare agent session with resume data
        session = {
          stream: new MessageStream(),
          generator: null,
          sessionId: sessionData.sessionId,
          lastAssistantUuid: sessionData.lastAssistantUuid,
        };

        // Send full session to client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'session_loaded', session: sessionData }));
        }

        console.log(`[ws] Loaded session ${sessionData.id}: ${sessionData.title}`);
        break;
      }
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
