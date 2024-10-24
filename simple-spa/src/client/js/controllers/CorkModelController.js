import { getLogger, Registry } from '@ucd-lib/cork-app-utils';

/**
 * @description Controller for fetching data using a Cork model.
 * Will automatically set property and request host update if the data request is successful.
 * Currently, does not leverage cork update events, so properties will be updated every time the get method is called.
 * @example
 * import CorkModelController from './CorkModelController.js';
 *
 * // in a LitElement constructor
 * this.foo = new CorkModelController(this, 'FooModel', [property: 'list', method: 'list', defaultValue: []]);
 *
 * // when you want to get the data (usually onAppStateUpdate)
 * this.foo.list.get();
 *
 * // in the template
 * html`<div>${this.foo.list.value.map(f => f.name).join()}</div>`
 */
export default class CorkModelController {

  /**
   *
   * @param {LitElement} host - The host element that will use this controller
   * @param {String} modelName - A registered cork model name
   * @param {Object[]} propertyMapper - An array of configuration objects for each property to map
   * @param {String} propertyMapper[].property - The property name to set on this controller
   * @param {String} propertyMapper[].method - The method name to call on the model
   * @param {Function} propertyMapper[].transform - An optional function to transform the response payload before setting the property
   * @param {Any} propertyMapper[].defaultValue - The default value for the property
   */
  constructor(host, modelName, propertyMapper=[]) {
    this.logger = getLogger(`${modelName}Controller`);
    this.host = host;
    host.addController(this);
    if ( !Registry.models[modelName] ) {
      throw new Error(`Model ${modelName} not found in Registry.models`);
    }
    this.model = Registry.models[modelName];
    this.propertyMapper = propertyMapper;
    this._initProperties();
  }

  /**
   * @description Initialize the properties on this controller based on the propertyMapper
   */
  _initProperties(){
    for (let config of this.propertyMapper) {
      if ( typeof this.model[config.method] !== 'function' ) {
        this.logger.warn(`Method ${config.method} not found on model ${this.model.constructor.name}`);
        continue;
      }
      this[config.property] = {
        value: config.defaultValue || '',
        get: (...args) => this._getProperty(config, ...args)
      };
    }
  }

  /**
   * @description Call a model method and return the response
   * @param {String} method - The method name to call on the model
   * @param  {...any} args - Arguments to pass to the method
   * @returns {Promise<Object>} resolves to the response from the model method
   */
  async _get(method, ...args) {
    this.logger.debug(`_get ${method}`, args);
    let response = this.model[method](...args);
    if ( response instanceof Promise ) {
      response = await response;
    } else if ( response?.request instanceof Promise ) {
      response = await response.request;
    }
    this.logger.debug(`_get ${method} response`, response);
    return response;
  }

  /**
   * @description Get and set the property value using the model method
   * @param {Object} config - The property configuration object
   * @param  {...any} args - Arguments to pass to the model method
   * @returns {Promise<Object>} resolves to the response from the model method
   */
  async _getProperty(config, ...args){
    const {property, method, transform} = config;
    let response = await this._get(method, ...args);
    if ( response?.state === 'loaded' ) {
      let payload = response.payload;
      if ( transform ) {
        payload = JSON.parse(JSON.stringify(payload));
        payload = transform(payload);
      }
      this.logger.debug(`_getProperty ${method} ${property}`, payload);
      this[property].value = payload;
      this.host.requestUpdate();
    }
    return response;
  }

}
