import pg from "./pg.js";
import EntityFields from "../utils/entity/EntityFields.js";
import BaseModel from "./BaseModel.js";

/**
 * @class Settings
 * @description Model for settings table where application settings are stored such as custom html to display on a page
 */
class Settings extends BaseModel {
  constructor(){
    super();
    this.table = 'settings';
    this.entityFields = new EntityFields([
      {
        dbName: 'settings_id',
        validation: {
          required: true,
          type: 'positive-integer',
          custom: this._validateId.bind(this)
         }
      },
      { dbName: 'key' },
      {
        dbName: 'value',
        validation: {
          charLimit: 3000
        }
      },
      { dbName: 'label' },
      { dbName: 'description' },
      { dbName: 'default_value'},
      {
        dbName: 'use_default_value',
        validation: {
          type: 'boolean'
        }
      },
      { dbName: 'input_type' },
      { dbName: 'categories' }
    ]);
  }

  /**
   * @description Get settings object by key
   * @param {String} key - key of the setting
   * @param {Boolean} multiple - if true, return array of settings objects
   * @returns {Object|Array}
   */
  async getByKey(key, multiple){
    const res = await pg.query(`SELECT * FROM ${this.table} WHERE key = $1`, [key]);
    if( res.error ) return res;
    const data = this.entityFields.toJsonArray(res.res.rows);
    if( !multiple ) {
      return data[0] || null;
    }
    return data;
  }

  /**
   * @description Get single settings value by key
   * @param {String} key - key of the setting
   * @param {*} defaultValue - default value to return if setting not found
   * @param {Boolean} suppressError - if true, return defaultValue if setting not found
   * @returns {Object|String}
   */
  async getValue(key, defaultValue=null, suppressError=false){
    const res = await this.getByKey(key);
    if( res.error ) {
      if ( suppressError ) return defaultValue;
      return res;
    }
    if ( !res ) return defaultValue;

    if ( res.useDefaultValue ) {
      return res.defaultValue;
    }
    return res.value;
  }

  /**
   * @description Get settings objects by category
   * @param {String} categories - category of the setting
   * if multiple categories are provided, settings with any of the categories will be returned
   * @returns {Array}
   */
  async getByCategory(...categories){
    if ( !categories.length ) {
      return this.customValidationError('At least one category must be provided');
    }
    const sql = `
      SELECT * FROM ${this.table}
      WHERE categories && $1
      ORDER BY label
      `
    const res = await pg.query(sql, [categories]);
    if( res.error ) return res;
    return this.entityFields.toJsonArray(res.res.rows);
  }

  /**
   * @description Update a setting
   * @param {Object} setting - a setting object
   * @returns {Object} - { success: true } or { error }
   */
  async update(setting){
    setting = this.entityFields.toDbObj(setting);
    const editableFields = ['value', 'use_default_value'];
    const validation = await this.entityFields.validate(setting, { includeFields: [...editableFields, 'settings_id'] });
    if ( !validation.valid ) {
      return this.formatValidationError(validation);
    }

    const id = setting.settings_id;
    const update = pg.prepareObjectForUpdate(setting, { includeFields: editableFields });
    const sql = `
      UPDATE ${this.table}
      SET ${update.sql}
      WHERE settings_id = $${update.values.length + 1}
    `;
    const r = await pg.query(sql, [...update.values, id]);
    if ( r.error ) return this.formatError(r.error);

    return { success: true };
  }

  /**
   * @description Validate settings_id - see entityFields.validate for parameter descriptions
   * @returns
   */
  async _validateId(field, value, validator){
    if ( validator.fieldHasError(field) ) return;

    const sql = `
      SELECT settings_id FROM ${this.table} WHERE settings_id = $1
    `;
    const result = await pg.query(sql, [value]);
    if ( !result.res.rowCount ) {
      validator.addError(field, 'invalid', `Id '${value}' does not exist`);
    }
  }

}

export default new Settings();
