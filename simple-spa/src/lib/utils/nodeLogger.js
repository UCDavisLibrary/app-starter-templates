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

  stringify(obj) {

    if ( obj instanceof Error ){
      console.log('here');
      return JSON.stringify({
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        ...obj
      });
    }

    return JSON.stringify(obj);
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

    let errorObj = error;
    try {
      if ( typeof error === 'object') {
        errorObj = {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...error
        }
      }
    } catch (error) {
      this.log('Error formatting error object', error);
    }

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
      error: errorObj
    }
  }
}

export default new NodeLogger();
