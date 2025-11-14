// src/config.ts
import path from 'path';
import fs from 'fs';
import { createHooks } from 'hookable';
import jiti from 'jiti';

export interface PluginManifest {
  ui: string;
  main: string | { sandbox: string; host?: string };
}

const root = process.cwd();
const resolveModule = (p: string) => jiti(root)(p).default;

export const getManifest = (): PluginManifest => {
  return resolveModule('./manifest.json');
};

export const getUIStaticPath = (): string => {
  const { ui } = getManifest();
  return path.resolve(root, ui);
};

export const getStaticPath = (): string => {
  const { ui } = getManifest();
  return path.join(ui, '../');
};

export const getFile = (p?: string): string => {
  return fs.readFileSync(path.resolve(root, p || ''), 'utf8');
};

export const PLUGIN_DEV_PORT = 5201;
export const hooks = createHooks();