import express from 'express';
import serverConfig from './lib/serverConfig.js';
import setUpStaticRoutes from './lib/static.js';
import setUpApiRoutes from "./api/index.js"

const app = express();

app.use(express.json());

// setup api routes
setUpApiRoutes(app);

// setup static app routes including spa
setUpStaticRoutes(app);

serverConfig.printStatus();
app.listen(serverConfig.port.container);
