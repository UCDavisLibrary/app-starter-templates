import pg from "./pg.js";
import EntityFields from "../utils/entity/EntityFields.js";
import BaseModel from "./BaseModel.js";

/**
 * @description Model for accessing the foo table
 */
class Foo extends BaseModel {

  constructor(){
    super();
    this.table = 'foo';
    this.entityFields = new EntityFields([
      {
        dbName: 'id',
        validation: {
          required: true,
          type: 'positive-integer',
          custom: this._validateId.bind(this)
         }
      },
      {
        dbName: 'name',
        validation: {
          required: true,
          charLimit: 100
        }
      }
    ]);
  }

  async getAll(){
    let text = `
      SELECT * FROM foo
    `;
    const r = await pg.query(text);
    if ( r.error ) return { error: r };

    return this.entityFields.toJsonArray(r.res.rows);
  }

  async create(data){
    data = this.entityFields.toDbObj(data);
    delete data.id;
    const validation = await this.entityFields.validate(data, { excludeFields: ['id'] });
    if ( !validation.valid ) {
      return this.returnValidationError(validation);
    }
    const i = pg.prepareObjectForInsert(data);
    const sql = `
      INSERT INTO ${this.table}
      (${i.keysString}) VALUES (${i.placeholdersString})
      RETURNING id
    `
    const r = await pg.query(sql, i.values);
    if ( r.error ) return this.returnError(r.error);

    return { id: r.res.rows[0].id, success: true };
  }

  async update(data){
    data = this.entityFields.toDbObj(data);
    const validation = await this.entityFields.validate(data);
    if ( !validation.valid ) {
      return this.returnValidationError(validation);
    }
    const id = data.id;
    delete data.id;
    const update = pg.prepareObjectForUpdate(data);
    const sql = `
      UPDATE ${this.table}
      SET ${update.sql}
      WHERE id = $${update.values.length + 1}
    `;
    const r = await pg.query(sql, update.values);
    if ( r.error ) return this.returnError(r.error);

    return { success: true };
  }

  async _validateId(field, value, validator){
    if ( validator.fieldHasError(field) ) return;

    const sql = `
      SELECT id FROM ${this.table} WHERE id = $1
    `;
    const result = await pg.query(sql, [value]);
    if ( !result.res.rowCount ) {
      validator.addError(field, 'invalid', 'This id does not exist');
    }
  }
}

export default new Foo();
