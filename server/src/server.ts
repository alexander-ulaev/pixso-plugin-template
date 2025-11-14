import express from 'express';
import expressWs from 'express-ws';
import path from 'path';
import { getUIStaticPath, getStaticPath, PLUGIN_DEV_PORT } from './config';
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

  // Serve static files from the UI directory
  const staticPath = path.resolve(process.cwd(), getStaticPath());
  app.use(express.static(staticPath, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store');
    },
    index: false
  }));

  // Serve the main UI file for all other routes
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(getUIStaticPath());
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