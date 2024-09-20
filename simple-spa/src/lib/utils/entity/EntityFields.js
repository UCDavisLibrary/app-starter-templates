import Validator from './Validator.js';
/**
 * @class EntityFields
 * @description Used to define fields of an entity (usually a database table) and perform validations
 * @param {Array} fields - array of field objects with the following properties:
 * - dbName {String} REQUIRED - name of the field in the database (should be snake_case)
 * - jsonName {String} OPTIONAL - name of the field in JSON responses (will default to camelCase of dbName)
 * - required {Boolean} OPTIONAL - if the field is required
 * - charLimit {Number} OPTIONAL - maximum number of characters allowed
 * - customValidation {Function} OPTIONAL - custom validation function
 */
export default class EntityFields {
  constructor(fields = [], kwargs={}) {
    this.fields = fields;
    this._makeJsonNames();
    this.jsonBuildObjectTable = kwargs.jsonBuildObjectTable || '';
  }

  async validate(data, kwargs={}){
    const validator = new Validator(this, kwargs);
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
