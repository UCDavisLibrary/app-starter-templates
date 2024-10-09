import { getLogger } from '@ucd-lib/cork-app-utils';

export default class SettingsController {
  constructor(host, category, propertyMapper) {
    this.logger = getLogger(`SettingsController-${host.constructor.name}-${category}`);
    this.host = host;
    this.category = category;
    this.categoryConfig = categoryConfig;
    this.propertyMapper = propertyMapper;
    host.addController(this);
    this._init();
  }

  /**
   * @description Set the property mapper, which maps settings to properties on this class.
   * @param {Array} propertyMapper - Array of setting name strings or objects with the following properties:
   * - setting: setting name
   * - property: property name to set on this class
   * - defaultValue: default value if setting is not found
   */
  setPropertyMapper(propertyMapper=[]){
    const defaultValue = '';
    this.propertyMapper = propertyMapper.map(item => {
      if ( typeof item === 'string' ) {
        let property = this._toCamelCase(item);
        return {setting: item, property, defaultValue};
      }
      if ( !item.property ) {
        item.property = this._toCamelCase(item.setting);
      }
      if ( item.defaultValue === undefined ) {
        item.defaultValue = defaultValue;
      }
      return item;

    });
  }

  /**
   * @description Convert a string to camel case
   * @param {String} str
   * @returns
   */
  _toCamelCase(str){
    return str.replace(/[-.]/g, '_').replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * @description Get the settings for the category
   * @returns {Promise} resolves to the settings for the category
   */
  get(){
    return this.host.SettingsModel.getByCategory(this.category);
  }

  /**
   * @description Wire up the controller to listen to the SettingsModel updates
   */
  _init() {

    if ( this.host['_onSettingsGetByCategoryUpdate'] ){
      this.logger.debug('Host callback already exists, not setting up again');
      return;
    }

    this.logger.debug('Setting up host callback');
    this.host['_onSettingsGetByCategoryUpdate'] = (e) => this._onSettingsUpdate(e);
    this.host._injectModel('SettingsModel');

    // check if settings are already loaded and call callback if they are
    const data = this.host.SettingsModel.store.data.getByCategory.get(this.category);
    if ( data?.state === 'loaded' ) {
      this.logger.debug('Settings already loaded, calling callback');
      this._onSettingsUpdate(data);
    } else {
      // set default host properties
      this.propertyMapper.forEach(item => {
        this[item.property] = item.defaultValue;
      });
      this.host.requestUpdate();
    }
  }

  _onSettingsUpdate(e){
    if ( e.state !== 'loaded' || e.settingsCategory != this.category ) return;
    this.logger.info('Settings loaded', e);

  }
}
