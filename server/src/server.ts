import express from 'express';
import expressWs from 'express-ws';
import { UI_HTML, MAIN_JS, PLUGIN_DEV_PORT, getManifest } from './config';
import { setupWebSocket } from './websocket';
import { startWatch } from './watch';
import type { Middleware } from './types';

export const setupDevServer = (middleware?: Middleware): void => {
  const app = express();

  // Apply custom middleware if provided
  if (middleware) {
    middleware(app);
  }

  // Setup WebSocket
  const eWs = expressWs(app);
  setupWebSocket(eWs.app);

  // Start file watching
  startWatch();

  // Serve the main JS file
  app.get('*/main.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/javascript');
    res.send(MAIN_JS);
  });

  // Serve the main UI file for all other routes
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/html');
    res.send(UI_HTML);
  });

  // Start the server
  app.listen(PLUGIN_DEV_PORT, () => {
    console.log(`Plugin dev server running on http://localhost:${PLUGIN_DEV_PORT}`);
    console.log(`WebSocket available on ws://localhost:${PLUGIN_DEV_PORT}/plugin`);
  });
};

// Auto-start if this file is run directly
if (require.main === module) {
  setupDevServer();
}
