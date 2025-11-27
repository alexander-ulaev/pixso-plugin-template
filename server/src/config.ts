// src/config.ts
import { createHooks } from 'hookable';

// These will be injected by the build script
declare const __UI_HTML__: string;
declare const __MAIN_JS__: string;
declare const __MANIFEST__: PluginManifest;

export const UI_HTML = __UI_HTML__;
export const MAIN_JS = __MAIN_JS__;

export interface PluginManifest {
  ui: string;
  main: string | { sandbox: string; host?: string };
}

export const getManifest = (): PluginManifest => {
  return __MANIFEST__;
};

export const PLUGIN_DEV_PORT = 5201;
export const hooks = createHooks();
