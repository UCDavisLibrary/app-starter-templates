class TypeTransform {

  /**
   * @description Convert value to a positive integer
   * @param {*} value - value to convert
   * @param {Boolean} convertFloat - if value is a float, convert to int - otherwise, return null
   * @returns {Number|null} - positive integer or null
  */
  toPositiveInt(value, convertFloat = false) {
    if ( convertFloat ) {
      value = parseInt(value);
    } else {
      value = Number(value);
    }

    if (
      isNaN(value) ||
      value < 1 ||
      !Number.isInteger(value)
    ) {
      return null;
    }

    return value;
  }


  /**
   * @description Convert snake or kebab case to camel case
   * @param {String} str
   * @returns {String}
   */
  toCamelCase(str='') {
    str = String(str);
    return str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
    );
  }

  /**
   * @description Convert camel or snake case to kebab case
   * @param {String} str
   * @returns {String}
   */
  toKebabCase(str='') {
    str = String(str);

    // snake_case to kebab-case
    str = str.replace(/_/g, '-');

    // camelCase to kebab-case
    str = str.replace(/([a-z])([A-Z])/g, '$1-$2');

    return str.toLowerCase();
  }

  /**
   * @description Wrap value in an array if it is not already an array
   * @param {*} value
   * @returns {Array}
   */
  toArray(value) {
    if ( !value ) return [];
    if ( Array.isArray(value) ) return value;
    return [value];
  }

  /**
   * @description Split a string into an array of values and optionally convert to integers
   * @param {String} value - the value to split
   * @param {Boolean} asInt - if true, convert to integers
   * @returns {Array}
   */
  explode(value, asInt=false){
    let out = [];
    if ( !value ) return out;
    if ( Array.isArray(value) ) {
      out = value.map(item => typeof item === 'string' ? item.trim() : item);
    } else if ( typeof value === 'string' ) {
      out = value.split(',').map(item => item.trim());
    } else {
      return out;
    }
    if ( !asInt ) return out;
    return out.map(item => parseInt(item)).filter(item => !isNaN(item));
  }
}

export default new TypeTransform();
