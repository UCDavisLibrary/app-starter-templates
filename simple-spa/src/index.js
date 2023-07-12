import express from 'express';
import serverConfig from './lib/serverConfig.js';
import setUpStaticRoutes from './lib/static.js';

const app = express();

app.use(express.json());

// setup api routes
//require('./api')(app);

// setup static app routes including spa
setUpStaticRoutes(app);

const port = serverConfig.port.container;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
