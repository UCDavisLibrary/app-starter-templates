/**
 * @description Base class for database models
 */
export default class BaseModel {

  /**
   * @description Object to return by database model when validation fails
   * @param {Object} v - object returned by validation method
   * @returns {Object}
   */
  returnValidationError(v){
    const error = new Error('Validation error');
    return {
      ...v,
      error,
      is400: true,
    };
  }

  /**
   * @description Object to return by database model when a generic error occurs (probably a 500)
   * @param {*} error
   * @returns {Object}
   */
  returnError(error){
    if ( typeof error === 'string'){
      error = new Error(error);
    }
    return { error };
  }

}
