const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

// Read the content of the UI files
const uiHtmlPath = path.resolve(root, '..', 'dist', 'index.html');
const mainJsPath = path.resolve(root, '..', 'dist', 'main.js');
const manifestPath = path.resolve(root, '..', 'manifest.json');

const uiHtmlContent = fs.readFileSync(uiHtmlPath, 'utf8');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Esbuild configuration
const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  define: {
    '__UI_HTML__': JSON.stringify(uiHtmlContent),
    '__MAIN_JS__': JSON.stringify(mainJsContent),
    '__MANIFEST__': manifestContent,
  },
};

// Build single file
esbuild.build({
  ...buildOptions,
  format: 'cjs',
  outfile: 'dist/server.js',
}).catch(() => process.exit(1));

console.log('Server build complete.');
