import { getLogger, Registry } from '@ucd-lib/cork-app-utils';
import ValidationContoller from './ValidationController.js';

/**
 * @description Controller for simple CRUD operations using a Cork model.
 * Will automatically set property and request host update if the data request is successful.
 * Currently, does not leverage cork update events, so properties will be updated every time the get method is called.
 * @example
 * import CorkModelController from './CorkModelController.js';
 *
 * // ----------------
 * // TO GET DATA
 *
 * // in a LitElement constructor
 * this.foo = new CorkModelController(this, 'FooModel', [property: 'list', method: 'list', defaultValue: []]);
 *
 * // when you want to get the data (usually onAppStateUpdate)
 * this.foo.list.get();
 *
 * // render data in the template
 * html`<div>${this.foo.list.value.map(f => f.name).join()}</div>`
 * // ----------------
 *
 * // ----------------
 * // TO CREATE/UPDATE DATA
 * const payload = this.foo.payload;
 * <form @submit=${payload.create}>
 *  ${ payload.validation.renderErrorMessage() }
 *  <div class='field-container ${payload.validation.fieldErrorClass('name')}'>
 *    <label>Application Name</label>
 *    <input
 *      type='text'
 *      .value=${payload.get('name')}
 *      @input=${e => payload.set('name', e.target.value)} />
 *    ${ payload.validation.renderFieldErrorMessages('name') }
 *  </div>
 * </form>
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
  constructor(host, modelName, propertyMapper=[], payloadConfig={}) {
    this.logger = getLogger(`${modelName}Controller`);
    this.host = host;
    host.addController(this);
    this.model = Registry.getModel(modelName);
    this.AppStateModel = Registry.getModel('AppStateModel');
    this.propertyMapper = propertyMapper;
    this._initProperties();

    // setup create/update payload
    this.payloadConfig = payloadConfig;
    this.payload = {
      data: {},
      validation: new ValidationContoller(host),
      set: (...args) => this._setPayloadProperty(...args),
      toggle: (...args) => this._togglePayloadProperty(...args),
      get: (...args) => this._getPayloadProperty(...args),
      clear: () => this._clearPayload(),
      create: async (e) => await this._submitPayload('create', e),
      update: async (e) => await this._submitPayload('update', e)
    };
  }

  /**
   * @description Set the payload data and reset the validation errors
   * Makes a deep copy of the data to avoid reference issues
   * @param {Object} data
   */
  setPayloadData(data){
    data = JSON.parse(JSON.stringify(data));
    this.payload.data = data;
    this.payload.validation.reset();
  }

  /**
   * @description Toggle a boolean property on the payload data
   * @param {String} prop - The property name to toggle
   */
  _togglePayloadProperty(prop){
    const value = !this.payload.data[prop];
    this._setPayloadProperty(prop, value);
  }

  /**
   * @description Set a property on the payload data and request a host update
   * @param {String} prop - The property name to set
   * @param {*} value - The value to set
   */
  _setPayloadProperty(prop, value){
    this.payload.data[prop] = value;
    this.payload.validation.clearErrorByField(prop);
    this.host.requestUpdate();
  }

  /**
   * @description Get a property from the payload data or the default value
   * @param {String} prop - The property name to get
   * @returns {*} The property value
   */
  _getPayloadProperty(prop){
    if ( this.payload.data[prop] !== undefined ) {
      return this.payload.data[prop];
    }
    return this.payloadConfig?.defaults?.[prop] || '';
  }

  /**
   * @description Clear the payload data and reset any validation errors
   */
  _clearPayload(){
    this.payload.data = {};
    this.payload.validation.reset();
  }

  /**
   * @description Submit the payload data to the model to be created or updated
   * @param {String} method - 'create' or 'update'
   * @param {*} submitEvent - The form submit event. Optional.
   * @returns
   */
  async _submitPayload(method='create', submitEvent){
    if ( submitEvent ) {
      submitEvent?.preventDefault?.();
    }
    let modelMethod = this.payloadConfig.createMethod || 'create';
    if ( method === 'update' ) {
      modelMethod = this.payloadConfig.updateMethod || 'update';
    }
    this.AppStateModel.showLoading();
    let r = await this._callModelMethod(modelMethod, this.payload.data);
    if ( r.state === 'error' &&  r.error?.payload?.is400 ){
      this.payload.validation.showErrors(r);
      this.host.show();
      let msg = this.payloadConfig.validationErrorMessage || 'Submission failed. Please correct the form errors and try again';
      if ( method === 'create' && this.payloadConfig.createErrorMessage ) {
        msg = this.payloadConfig.createErrorMessage;
      } else if ( method === 'update' && this.payloadConfig.updateErrorMessage ) {
        msg = this.payloadConfig.updateErrorMessage;
      }
      this.AppStateModel.showToast({message: msg, type: 'error'});
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showMessageIfServiceError(r);
    } else if ( r.state === 'loaded' ) {
      this.payload.clear();

      // show success message
      let msg = 'Form submitted successfully';
      if ( method === 'create' && this.payloadConfig.createSuccessMessage ) {
        msg = this.payloadConfig.createSuccessMessage;
      } else if ( method === 'update' && this.payloadConfig.updateSuccessMessage ) {
        msg = this.payloadConfig.updateSuccessMessage;
      }
      this.AppStateModel.showToast({message: msg, type: 'success'});

      // redirect if needed
      if ( this.payloadConfig.createSuccessLocation ){
        this.AppStateModel.setLocation(this.payloadConfig.createSuccessLocation);
        return;
      } else if ( this.payloadConfig.updateSuccessLocation ){
        this.AppStateModel.setLocation(this.payloadConfig.updateSuccessLocation);
        return;
      } else if ( this.payloadConfig.successLocation ) {
        this.AppStateModel.setLocation(this.payloadConfig.successLocation);
        return;
      }

      // call the success callback
      if ( this.payloadConfig.successCallback ) {
        this.payloadConfig.successCallback(r, method);
        return;
      }

      // show the page
      this.host.show();
    }

  };

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
  async _callModelMethod(method, ...args) {
    this.logger.debug(`_callModelMethod ${method}`, args);
    let response = this.model[method](...args);
    if ( response instanceof Promise ) {
      response = await response;
    }
    if ( response?.request instanceof Promise ) {
      await response.request;
      if ( !response.id ){
        this.logger.error(`_callModelMethod ${method} response missing id`, response);
      } else if ( !response.store ){
        this.logger.error(`_callModelMethod ${method} response missing store`, response);
      }
      response = response.store.get(response.id);
    }
    this.logger.debug(`_callModelMethod ${method} response`, response);
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
    let response = await this._callModelMethod(method, ...args);
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
