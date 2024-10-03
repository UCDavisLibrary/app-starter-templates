import express from 'express';
import config from '../lib/serverConfig.js';

import auth from './auth.js';
import settings from './settings.js';
import foo from './foo.js';

const router = express.Router();

if ( config.auth.requireAuth ) {
  auth(router);
}

settings(router);
// TODO: add your api routes here
// API routes are mounted at config.apiRoot
foo(router);

export default (app) => {
  app.use(config.apiRoot, router);
}
