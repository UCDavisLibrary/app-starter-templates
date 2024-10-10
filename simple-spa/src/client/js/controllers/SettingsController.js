import { getLogger } from '@ucd-lib/cork-app-utils';

/**
 * @description Controller for fetching settings from the SettingsModel
 */
export default class SettingsController {

  /**
   *
   * @param {LitElement} host - The host element that will use the settings
   * @param {Array} propertyMapper - Array of setting key strings or objects with the following properties:
   * - setting: setting key
   * - property: property name to set on this class
   * - defaultValue: default value if setting is not found
   * @param {String} category - The category of settings to fetch. Defaults to the host constructor name.
   */
  constructor(host, propertyMapper, category) {
    this.logger = getLogger(`SettingsController-${host.constructor.name}-${category}`);
    this.host = host;
    this.category = category || host.constructor.name;
    this._setPropertyMapper(propertyMapper);
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
  _setPropertyMapper(propertyMapper=[]){
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
    // essential when doing code splitting
    const data = this.host.SettingsModel.store.data.getByCategory.get(this.category);
    if ( data?.state === 'loaded' ) {
      this.logger.debug('Settings already loaded, calling callback');
      this._onSettingsUpdate(data);
    } else {
      this.logger.debug('Settings not loaded, setting up default properties');
      this._setDefaults(true);
    }
  }

  /**
   * @description Set the default values for the setting properties on this class
   * @param {Boolean} requestUpdate - if true, request an update from the host
   */
  _setDefaults(requestUpdate){
    this.propertyMapper.forEach(item => {
      this[item.property] = item.defaultValue;
    });
    if ( requestUpdate ){
      this.host.requestUpdate();
    }
  }

  /**
   * @description Update the properties on this class with the settings from the SettingsModel
   * @param {Object} e - SettingsModel getByCategory update event
   */
  _onSettingsUpdate(e){
    if ( e.state !== 'loaded' || e.settingsCategory != this.category ) return;
    this.logger.debug('Settings loaded', e);

    if ( !this.propertyMapper.length ){
      this._setPropertyMapper(e.payload.map(item => item.key));
      this._setDefaults(false);
    }

    this.propertyMapper.forEach(mapper => {
      let setting = e.payload.find(item => item.key === mapper.setting);
      if ( setting ) {
        this[mapper.property] = setting.useDefaultValue ? setting.defaultValue : setting.value;
      }
    });
    this.host.requestUpdate();
  }
}
