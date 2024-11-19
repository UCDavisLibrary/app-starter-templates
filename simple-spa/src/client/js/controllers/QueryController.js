import { Registry } from '@ucd-lib/cork-app-utils';
import qs from 'qs';

import appRoutes from '../../../lib/utils/appRoutes.js';
import typeTransform from '../../../lib/utils/typeTransform.js';
import objectUtils from '../../../lib/utils/objectUtils.js';

/**
 * @class QueryController
 * @description Controller for managing a page's query string parameters.
 */
export default class QueryController {

  constructor(host){
    this.host = host;
    host.addController(this);

    this.AppStateModel = Registry.getModel('AppStateModel');

    this.payload = {};
  }

  /**
   * @description Get a query string parameter
   * @param {String} prop - property name as camel case
   * @param {*} defaultValue - default value if property is not set
   * @returns
   */
  get(prop, defaultValue) {
    return this.payload[prop] || defaultValue;
  }

  /**
   * @description Get a query string parameter as an array
   * @param {String} prop - property name as camel case
   * @returns {Array}
   */
  getArray(prop) {
    return typeTransform.toArray(this.payload[prop]);
  }

  /**
   * @description Check if a query string parameter is equal to a value
   * @param {String} prop - property name as camel case
   * @param {*} value - value to compare
   * @param {Boolean} strict - if true, use strict equality
   * @returns {Boolean}
   */
  equals(prop, value, strict=false) {
    if( strict ) {
      return this.payload[prop] === value;
    }
    return this.payload[prop] == value;
  }

  /**
   * @description Check if a query string parameter array includes a value
   * @param {String} prop - property name as camel case
   * @param {*} value - value to check
   * @param {Boolean} asString - Convert all values to strings before comparing
   * @returns {Boolean}
   */
  includes(prop, value, asString) {
    if ( asString ){
      value = String(value);
      const arr = this.getArray(prop).map(v => String(v));
      return arr.includes(value);
    }
    return this.getArray(prop).includes(value);
  }

  /**
   * @description Toggle a boolean query string parameter
   * @param {String} prop
   */
  toggle(prop){
    if( this.get(prop) ) {
      this.set(prop, null);
    } else {
      this.set(prop, true);
    }
  }

  /**
   * @description Set a query string parameter. Will trigger an app state update.
   * @param {String} prop - property name as camel case
   * @param {*} value - value to set
   */
  set(prop, value){
    if ( prop !== 'page' ) {
      this.payload.page = '1';
    }
    if ( value === undefined || value === null || value === '' ) {
      delete this.payload[prop];
    } else if ( Array.isArray(value) && !value.length ) {
      delete this.payload[prop];
    } else {
      this.payload[prop] = value;
    }
    let queryStr = qs.stringify(objectUtils.kebabCaseKeys(this.payload));
    const loc = `${appRoutes.getPageLink(this.host.pageId)}?${queryStr}`;
    this.AppStateModel.setLocation(loc);
  }

  /**
   * @description Set query payload object from a query string.
   * @param {String} queryString - query string to parse. If not provided, will use window.location.search
   */
  setFromQueryString(queryString) {
    if ( !queryString ) queryString = location.search;
    this.payload = objectUtils.camelCaseKeys(qs.parse(queryString, { ignoreQueryPrefix: true }));

    if( !this.payload.page ) {
      this.payload.page = '1';
    }

    this.host.requestUpdate();
  }

}
