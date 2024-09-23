import util from 'util';

/**
 * @description A simple server-side logger
 */
class NodeLogger {
  constructor() {
    this.inspectSettings = { showHidden: false, depth: null, colors: true };
  }

  log(...args) {
    console.log(...args.map(arg => util.inspect(arg, this.inspectSettings)));
  }

  error(...args) {
    console.error(...args.map(arg => util.inspect(arg, this.inspectSettings)));
  }

  serverError(req, err) {
    const log = this._formatServerRequest(req, err);
    this.error('Server Error', log);
    return log.logId;
  }

  _formatServerRequest(req, error) {
    const logId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return {
      timestamp: (new Date()).toISOString(),
      logId,
      request: {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
      },
      user: req.auth?.token?.id,
      error
    }
  }
}

export default new NodeLogger();
