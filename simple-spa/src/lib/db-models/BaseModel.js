/**
 * @description Base class for database models
 */
export default class BaseModel {

  /**
   * @description Object to return by database model when validation fails
   * @param {Object} v - object returned by validation method
   * @returns {Object}
   */
  formatValidationError(v, message='Validation error'){
    const error = new Error(message);
    return {
      ...v,
      error,
      is400: true,
    };
  }

  customValidationError(message){
    return this.formatValidationError({}, message);
  }

  /**
   * @description Object to return by database model when a generic error occurs (probably a 500)
   * @param {String|Object} error - String or Error object - usually will be r.error from a db query
   * @returns {Object}
   */
  formatError(error){
    if ( typeof error === 'string'){
      error = new Error(error);
    }
    return { error };
  }

}
