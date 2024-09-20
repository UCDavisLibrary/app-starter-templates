export default class Validator {

  constructor(entityFields, kwargs={}) {
    this.entityFieldsClass = entityFields;
    this.keyType = kwargs.keyType || 'dbName';
    this.filterFields(kwargs.includeFields, kwargs.excludeFields);
  }

  /**
   * @description filter fields to validate
   * @param {Array} includeFields - list of fields to include. takes precedence over excludeFields
   * @param {Array} excludeFields - list of fields to exclude
   */
  filterFields(includeFields=[], excludeFields=[]){
    if ( includeFields?.length ){
      this.fields = this.entityFieldsClass.fields.filter(field => includeFields.includes(field[this.keyType]));
    } else if ( excludeFields?.length ){
      this.fields = this.entityFieldsClass.fields.filter(field => !excludeFields.includes(field[this.keyType]));
    } else {
      this.fields = this.entityFieldsClass.fields;
    }
  }
}
