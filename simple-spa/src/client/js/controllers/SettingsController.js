export default class SettingsController {
  constructor(host, category, categoryConfig) {
    this.host = host;
    this.category = category;
    this.categoryConfig = categoryConfig;
    host.addController(this);
    this._initModelCallback();
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
  _initModelCallback() {
    this.host['_onSettingsGetByCategoryUpdate'] = (e) => this._onSettingsUpdate(e);
    this.host._injectModel('SettingsModel');
  }

  _onSettingsUpdate(e){
    if ( e.state !== 'loaded' || e.settingsCategory != this.category ) return;
    console.log('SettingsController._onSettingsUpdate', e);

  }
}
