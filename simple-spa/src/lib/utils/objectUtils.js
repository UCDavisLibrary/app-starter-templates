import typeTransform from "./typeTransform.js";

class ObjectUtils {

  /**
   * @description Convert object keys to camel case from snake or kebab case
   * @param {Object} obj - object to convert
   * @returns {Object}
   */
  camelCaseKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[typeTransform.toCamelCase(key)] = obj[key];
      return acc;
    }, {});
  }

  /**
   * @description Convert object keys to kebab case from snake or camel case
   * @param {Object} obj - object to convert
   * @returns {Object}
   */
  kebabCaseKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[typeTransform.toKebabCase(key)] = obj[key];
      return acc;
    }, {});
  }

  /**
   * @description Chunk an array into smaller arrays of a specified size
   * @param {Array} arr - array to chunk
   * @param {Integer} size - size of chunks
   * @returns {Array}
   */
  chunkArray(arr, size) {
    return arr.reduce((acc, _, i) => {
      if (i % size === 0) {
        acc.push(arr.slice(i, i + size));
      }
      return acc;
    }, []);
  }

}

export default new ObjectUtils();
