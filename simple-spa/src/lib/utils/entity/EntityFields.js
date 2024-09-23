import Validator from './Validator.js';

/**
 * @class EntityFields
 * @description Used to define fields of an entity (usually a database table) and perform validations
 * @param {Array} fields - array of field objects with the following properties:
 * - dbName {String} REQUIRED - name of the field in the database (should be snake_case)
 * - jsonName {String} OPTIONAL - name of the field in JSON responses (will default to camelCase of dbName)
 * - validation {Object} OPTIONAL - object with validation options including:
 *  - required {Boolean} OPTIONAL - whether the field is required
 *  - charLimit {Number} OPTIONAL - maximum number of characters allowed
 *  - type {String} OPTIONAL - type of the field (e.g. 'string', 'number', 'boolean')
 *  - custom {Function} OPTIONAL - custom validation function or object with properties:
 *   - fn {Function} REQUIRED - custom validation function that accepts field, value, and validator class as arguments
 *   - position {String} OPTIONAL - 'after' to run after all other validations
 */
export default class EntityFields {
  constructor(fields = [], kwargs={}) {
    this.fields = fields;
    this._makeJsonNames();
    this.jsonBuildObjectTable = kwargs.jsonBuildObjectTable || '';
  }

  /**
   * @description Validate data based on entity fields
   * @param {Object} data - entity data to validate
   * @param {Object} kwargs - additional optional arguments to pass to the validator
   * @returns {Object} - object with valid (Boolean) and fieldsWithErrors (Array) properties
   */
  async validate(data, kwargs){
    const validator = new Validator(this, data, kwargs);
    await validator.validate();

    if ( kwargs?.returnValidator ) return validator;
    return {
      valid: validator.valid,
      fieldsWithErrors: validator.fieldsWithErrors
    };
  }

  /**
   * @description Add jsonName to fields that don't have it
   */
  _makeJsonNames(){
    this.fields.forEach(field => {
      if ( field.jsonName ) return;
      field.jsonName = field.dbName.replace(/(_\w)/g, m => m[1].toUpperCase());
    });
  }

  /**
   * @description Convert an object with database field names to an object with JSON field names
   * @param {Object} obj - object with database field names
   * @returns {Object}
   */
  toJsonObj(obj={}) {
   if ( typeof obj !== 'object' || Array.isArray(obj) ) return {};
   const out = {};

   this.fields.forEach(field => {
     if ( !field.jsonName || !field.dbName || !obj.hasOwnProperty(field.dbName) ) return;
     out[field.jsonName] = obj[field.dbName];
   });

   return out;
  }

  /**
   * @description Convert an array of objects with database field names to an array of objects with JSON field names
   * @param {Array} arr - array of objects with database field names
   * @returns {Array}
   */
  toJsonArray(arr=[]) {
   return arr.map(obj => this.toJsonObj(obj));
  }

  /**
   * @description Convert an object with JSON field names to an object with database field names
   * @param {Object} obj - object with JSON field names
   * @returns {Object}
   */
  toDbObj(obj={}) {
   if ( typeof obj !== 'object' || Array.isArray(obj) ) return {};

   const out = {};

   this.fields.forEach(field => {
     if ( !field.jsonName || !field.dbName || !obj.hasOwnProperty(field.jsonName) ) return;
     out[field.dbName] = obj[field.jsonName];
   });

   return out;
  }

  /**
   * @description Convert an array of objects with json field names to an array of objects with database field names
   * @param {Array} arr - array of objects with JSON field names
   */
  toDbArray(arr=[]) {
   return arr.map(obj => this.toDbObj(obj));
  }

  /**
   * @description Returns a json_build_object sql function with the fields of this class
   * @returns {String}
   */
  jsonBuildObject() {
   const args = [];
   for (const field of this.fields) {
     if ( field.jsonBuildObjectOptions?.exclude ) continue;
     const table = field.jsonBuildObjectOptions?.table || this.jsonBuildObjectTable;
     if ( !table ) continue;
     args.push(`'${field.jsonName}', ${table}.${field.dbName}`);
   }
   return `json_build_object(${args.join(', ')})`;
  }

}
