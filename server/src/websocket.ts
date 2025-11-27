import expressWs from 'express-ws';
import { WebSocket } from 'ws';
import { hooks } from './config';
import type { FileType } from './types';

type WebSocketMessage = {
  name: FileType;
  content: string;
};

const pool: WebSocket[] = [];
const messages = new Map<FileType, string>();

const remove = (ws: WebSocket, list: WebSocket[]): void => {
  const idx = list.indexOf(ws);
  if (idx === -1) return;
  list.splice(idx, 1);
};

export const setupWebSocket = (app: expressWs.Application): void => {
  // Subscribe to file updates
  hooks.hook('update', (name: FileType, content: string) => {
    const old = messages.get(name);
    if (old && old === content) return;
    
    messages.set(name, content);
    
    // Send update to all connected clients
    pool.forEach((socket) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ name, content }));
      }
    });
  });

  // WebSocket endpoint for plugin updates
  app.ws('/plugin', (ws) => {
    pool.push(ws);

    // Send all current messages to new client
    messages.forEach((content, name) => {
      ws.send(JSON.stringify({ name, content }));
    });

    ws.on('message', (msg) => {
      console.log('WebSocket message:', msg.toString());
    });

    ws.on('error', (err) => {
      console.log('WebSocket error', err);
      remove(ws, pool);
    });

    ws.on('close', () => {
      remove(ws, pool);
    });
  });
};
