import chokidar from 'chokidar';
import chalk from 'chalk';
import { getManifest, getFile, hooks } from './config';
import { formatTime } from './utils';
import type { FileType } from './types';

export const startWatch = (): void => {
  const { main, ui } = getManifest();
  let sandbox: string, host: string | undefined;

  if (typeof main === 'object') {
    sandbox = main.sandbox;
    host = main.host;
  } else {
    sandbox = main;
  }

  let time0: NodeJS.Timeout, time1: NodeJS.Timeout, time2: NodeJS.Timeout, time3: NodeJS.Timeout;

  const watchFile = (path: string, type: FileType) => {
    chokidar.watch(path).on('add', (path) => {
      console.log(chalk.green('[plugin-cli]: '), `add ${path} ${chalk.gray(formatTime())}`);
      handleFileChange(type);
    }).on('change', (path) => {
      console.log(chalk.green('[plugin-cli]: '), `change ${path} ${chalk.gray(formatTime())}`);
      handleFileChange(type);
    }).on('unlink', (path) => {
      console.log(chalk.green('[plugin-cli]: '), `unlink ${path} ${chalk.gray(formatTime())}`);
      handleFileChange(type);
    });
  };

  const handleFileChange = (type: FileType) => {
    switch (type) {
      case 'main':
        clearTimeout(time0);
        time0 = setTimeout(() => {
          const mainCode = getFile(sandbox);
          hooks.callHook('update', type, mainCode);
        }, 101);
        break;
      case 'host':
        clearTimeout(time1);
        time1 = setTimeout(() => {
          const hostCode = getFile(host);
          hooks.callHook('update', type, hostCode);
        }, 101);
        break;
      case 'ui':
        clearTimeout(time2);
        time2 = setTimeout(() => {
          const uiCode = getFile(ui);
          hooks.callHook('update', type, uiCode);
        }, 101);
        break;
      case 'manifest':
        clearTimeout(time3);
        time3 = setTimeout(() => {
          const manifest = getFile('./manifest.json');
          hooks.callHook('update', type, manifest);
        }, 101);
        break;
    }
  };

  watchFile(sandbox, 'main');
  if (host) {
    watchFile(host, 'host');
  }
  watchFile(ui, 'ui');
  watchFile('./manifest.json', 'manifest');
};