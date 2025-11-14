import { Express } from 'express';

export type Middleware = (app: Express) => void;
export type FileType = 'main' | 'host' | 'ui' | 'manifest';