/**
 * @description Validator class for entity data. use await validator.validate() to validate data
 * @param {EntityFields} entityFields - EntityFields class instance
 * @param {Object} data - entity data to validate
 * @param {Object} kwargs - additional arguments
 * @param {Array} kwargs.includeFields - list of fields to include in validation. takes precedence over excludeFields
 * @param {Array} kwargs.excludeFields - list of fields to exclude from validation
 */
export default class Validator {

  constructor(entityFields, data, kwargs={}) {
    this.entityFieldsClass = entityFields;
    this.data = data;
    this.keyType = kwargs.keyType || 'dbName';
    this.errorKeyType = kwargs.errorKeyType || 'jsonName';
    this._setFields(kwargs.includeFields, kwargs.excludeFields);

    this.valid = true;
    this.fieldsWithErrors = [];

    this.errorTypes = {
      required: this.getErrorObject('required', 'This field is required'),
      charLimit: this.getErrorObject('charLimit', 'This value is too long'),
      invalidType: this.getErrorObject('invalidType', 'This value is invalid')
    };
  }

  /**
   * @description Validate data based on entity fields
   * @param {Object} data - entity data to validate
   */
  async validate(data){
    if ( data ) this.data = data;
    this.valid = true;
    this.fieldsWithErrors = [];

    for (const field of this.fields) {
      const value = this.data[field[this.keyType]];
      this._validateRequired(field, value);
      this._validateCharLimit(field, value);
      this._validateType(field, value);

      const customValidation = this._validatorArg(field, 'custom');
      if (
        typeof customValidation === 'function' ) {
        await this._callCustom(customValidation, field, value);
      } else if ( customValidation?.fn && !customValidation?.position ) {
        await this._callCustom(customValidation.fn, field, value);
      }
    }

    for (const field of this.fields) {
      const customValidation = this._validatorArg(field, 'custom');
      if ( customValidation?.fn && customValidation?.position === 'after' ) {
        await this._callCustom(customValidation.fn, field, this.data[field[this.keyType]]);
      }
    }

    // convert fieldId property in fieldsWithErrors to errorKeyType if different
    // default behavior is to convert dbName to jsonName
    if ( this.keyType != this.errorKeyType ) {
      this.fieldsWithErrors.forEach(field => {
        field.fieldId = this.fields.find(f => f[this.keyType] === field.fieldId)[this.errorKeyType];
      });
    }
  }

  /**
   * @description Validate a field with a custom function
   * @param {Function} fn - custom validation function
   * @param {Object} field - field object
   * @param {*} value - value to check
   */
  async _callCustom(fn, field, value){
    const result = fn(field, value, this);
    if ( result instanceof Promise ) {
      await result;
    }
  }

  /**
   * @description Check if a value exists
   * @param {Object} field - field object
   * @param {*} value - value to check
   */
  _validateRequired(field, value){
    if ( this._validatorArg(field, 'required') && ( value === undefined || value === null || value === '' ) ){
      const { errorType, message } = this.errorTypes.required;
      this.addError(field[this.keyType], errorType, message);
    }
  }

  /**
   * @description Check if a value is within the character limit
   * @param {Object} field - field object
   * @param {*} value - value to check
   */
  _validateCharLimit(field, value){
    const charLimit = this._validatorArg(field, 'charLimit');
    if ( !charLimit ) return;
    if ( this.fieldHasError(field, 'required') ) return;
    value = value?.toString() || '';
    if ( value.length > charLimit ){
      const { errorType } = this.errorTypes.charLimit;
      const message = `This field must be ${charLimit} characters or less`;
      this.addError(field[this.keyType], errorType, message);
    }
  }

  /**
   * @description Check if a value is of the correct type
   * @param {Object} field - field object
   * @param {*} value - value to check
   * @returns
   */
  _validateType(field, value){
    let fieldType = this._validatorArg(field, 'type');
    if ( !fieldType ) return;
    fieldType = fieldType.toLowerCase();
    const acceptedTypes = {
      'string': this.isString,
      'number': this.isNumber,
      'integer': this.isInteger,
      'positive-integer': this.isPositiveInteger,
      'positive-number': this.isPositiveNumber,
      'boolean': this.isBoolean,
      'iso-date': this.isIsoDate,
      'iso-datetime': this.isIsoDatetime
    };
    if ( !Object.keys(acceptedTypes).includes(fieldType) ) {
      throw new Error(`Invalid field type (${fieldType}) for field ${field[this.keyType]}`);
    }

    if ( this.fieldHasError(field, 'required') ) return;
    if ( value === undefined || value === null ) return;

    const { errorType } = this.errorTypes.invalidType;
    const message = `This field must be a ${fieldType}`;
    if ( !acceptedTypes[fieldType].call(this, value) ){
      this.addError(field[this.keyType], errorType, message);
    }
  }

  /**
   * @description Check if a value is a string
   * @param {*} value
   * @returns {Boolean}
   */
  isString(value){
    return typeof value === 'string';
  }

  /**
   * @description Check if value can be converted to a number
   * excludes empty objects, arrays, and strings
   * @param {*} value
   * @returns
   */
  isNumber(value){
    if ( value === '0' || value === 0 ) return true;
    value = Number(value);
    return isNaN(value) || value == 0  ? false : true;
  }

  /**
   * @description Check if value is an integer
   * @param {*} value
   * @returns
   */
  isInteger(value){
    if ( !this.isNumber(value) ) return false;
    value = Number(value);
    return value % 1 === 0;
  }

  /**
   * @description Check if value is a positive integer
   * @param {*} value
   * @returns
   */
  isPositiveInteger(value){
    return this.isInteger(value) && value > 0;
  }

  /**
   * @description Check if value is a non-negative integer
   * @param {*} value
   * @returns
   */
  isNonNegativeInteger(value){
    return this.isInteger(value) && value >= 0;
  }

  /**
   * @description Check if value is a positive number
   * @param {*} value
   * @returns
   */
  isPositiveNumber(value){
    if ( !this.isNumber(value) ) return false;
    value = Number(value);
    return value > 0;
  }

  /**
   * @description Check if value is a non-negative number
   * @param {*} value
   * @returns
   */
  isNonNegativeNumber(value){
    if ( !this.isNumber(value) ) return false;
    value = Number(value);
    return value >= 0;
  }

  /**
   * @description Check if value is a boolean
   * @param {*} value
   * @returns
   */
  isBoolean(value){
    return typeof value === 'boolean';
  }

  /**
   * @description Check if value is an ISO string date
   * @param {*} value
   * @returns
   */
  isIsoDate(value){
    value = value?.toISOString?.() || value.toString();
    return value.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * @description Check if value is an ISO string datetime
   * @param {*} value
   * @returns
   */
  isIsoDatetime(value){
    value = value?.toISOString?.() || value.toString();
    return value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  }

  /**
   * @description filter fields to validate
   * @param {Array} includeFields - list of fields to include. takes precedence over excludeFields
   * @param {Array} excludeFields - list of fields to exclude
   */
  _setFields(includeFields=[], excludeFields=[]){
    if ( includeFields?.length ){
      this.fields = this.entityFieldsClass.fields.filter(field => includeFields.includes(field[this.keyType]));
    } else if ( excludeFields?.length ){
      this.fields = this.entityFieldsClass.fields.filter(field => !excludeFields.includes(field[this.keyType]));
    } else {
      this.fields = this.entityFieldsClass.fields;
    }
  }

  /**
   * @description Make validation error object
   * @param {String} errorType - type of error
   * @param {String} message - error message
   * @returns {Object}
   */
  getErrorObject(errorType='invalid', message='This value is invalid'){
    return { errorType, message };
  }

  /**
   * @description Add an error to the fieldsWithErrors
   * @param {String} fieldId - field id, either dbName or jsonName depending on keyType
   * @param {String} errorType - type of error
   * @param {String} message - error message
   */
  addError(fieldId, errorType, message){
    if ( typeof fieldId !== 'string' ) {
      fieldId = fieldId[this.keyType] || '';
    }
    this.valid = false;
    const field = this.fieldsWithErrors.find(f => f.fieldId === fieldId);
    if ( field ) {
      field.errors.push(this.getErrorObject(errorType, message));
    } else {
      this.fieldsWithErrors.push({ fieldId, errors: [this.getErrorObject(errorType, message)] });
    }
  }

  /**
   * @description Check if a field has an error
   * @param {String} fieldId - field id, either dbName or jsonName depending on keyType
   * @param {String} errorType - type of error. If not provided, check if the field has any error
   * @returns {Boolean}
   */
  fieldHasError(fieldId, errorType){
    if ( typeof fieldId !== 'string' ) {
      fieldId = fieldId[this.keyType] || '';
    }
    const error = this.fieldsWithErrors.find(f => f.fieldId === fieldId);
    if ( !error ) return false;
    if ( !errorType ) return true;
    return error.errors.some(e => e.errorType === errorType);
  }

  /**
   * @description Get value for a validation argument of a field
   * @param {Object} field - a field object from this.fields
   * @param {String} prop - property to get
   * @returns {*}
   */
  _validatorArg(field, prop ){
    if ( typeof field === 'string' ) {
      field = this.fields.find(f => f[this.keyType] === field);
    }
    return field.validation?.[prop];
  }
}
