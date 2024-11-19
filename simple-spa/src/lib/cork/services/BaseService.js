import { BaseService, getLogger } from '@ucd-lib/cork-app-utils';
import { appConfig } from '../../appGlobals.js';

/**
 * @class BaseServiceImp
 * @description Extends the cork-app-utils BaseService to add auth headers to requests
 * Import this class instead of BaseService directly from @ucd-lib/cork-app-utils
 */
export default class BaseServiceImp extends BaseService {
  constructor() {
    super();
  }

  /**
   * @description Adds auth headers to request before calling super.request
   * @param {Object} options - request options
   * @returns
   */
  async request(options){
    if( appConfig.auth?.keycloakClient ) {
      const kc = appConfig.auth.keycloakClient;
      if( !options.fetchOptions ) options.fetchOptions = {};
      if( !options.fetchOptions.headers ) options.fetchOptions.headers = {};
      try {
        await kc.updateToken(10);
        options.fetchOptions.headers.Authorization = `Bearer ${kc.token}`
      } catch (error) {}
    }
    return await super.request(options);
  }

  async clearCache(serviceResponse){
    if ( !this.storeCaches?.length ) return;
    if ( !serviceResponse ) {
      this.storeCaches.forEach(store => store.purge());
      return;
    };
    if ( serviceResponse instanceof Promise ) {
      serviceResponse = await serviceResponse;
    }
    if ( serviceResponse?.request instanceof Promise ) {
      await serviceResponse.request;
      if ( !serviceResponse.id ){
        this.logger.warn(`Unable to clear cache. Response does not have an id`, serviceResponse);
      } else if ( !serviceResponse.store ){
        this.logger.warn(`Unable to clear cache. Response does not have a store`, serviceResponse);
      }
      serviceResponse = serviceResponse.store.get(serviceResponse.id);
    }
    if ( serviceResponse?.state === 'loaded' ){
      this.storeCaches.forEach(store => store.purge());
    }
  }

  /**
   * @description Log if 500+ error. Will report to google cloud if APP_REPORT_ERRORS_ENABLED=true
   * @param {*} options
   * @param {*} resolve
   * @param {*} error
   */
  async _handleError(options, resolve, error) {
    await super._handleError(options, resolve, error);
    if ( error?.response?.status >= 500) {
      const e = {
        type: 'cork-service.server-error',
        payload: error?.payload,
        url: options.url,
      }
      if ( options.json && options?.fetchOptions?.body ){
        e.requestBody = JSON.parse(options.fetchOptions.body);
      }
      this.logger.error(e);
    }
  }

  _initLogger(name) {
    if( this._logger ) return;
    if (!name) name = this.constructor.name;
    this._logger = getLogger(name);
  }

  get logger() {
    this._initLogger();
    return this._logger;
  }
}
