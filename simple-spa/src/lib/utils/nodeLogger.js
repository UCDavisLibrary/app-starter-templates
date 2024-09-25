import util from 'util';
import serverConfig from '../serverConfig.js';

/**
 * @description A simple server-side logger
 */
class NodeLogger {
  constructor() {
    this.inspectSettings = { showHidden: false, depth: null, colors: true };
  }

  log(...args) {
    if ( serverConfig.serverLogFormat === 'inspect' ) {
      console.log(...args.map(arg => util.inspect(arg, this.inspectSettings)));
    } else if ( serverConfig.serverLogFormat === 'json' ) {
      console.log(...args.map(arg => JSON.stringify(arg)));
    } else {
      console.log(...args);
    }

  }

  error(...args) {
    if ( serverConfig.serverLogFormat === 'inspect' ) {
      console.error(...args.map(arg => util.inspect(arg, this.inspectSettings)));
    } else if ( serverConfig.serverLogFormat === 'json' ) {
      console.error(...args.map(arg => JSON.stringify(arg)));
    } else {
      console.error(...args);
    }
  }

  /**
   * @description Log a server error
   * @param {*} req - Express request object
   * @param {*} err - Error object
   * @returns {String} - The logId
   */
  serverError(req, err) {
    const log = this._formatServerRequest(req, err);
    this.error(log);
    return log.logId;
  }

  _generateLogId() {
    return Date.now() + '-' + Math.round(Math.random() * 1E9);
  }

  _formatServerRequest(req, error) {
    const logId = this._generateLogId();
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
