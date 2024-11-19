import { LitElement } from 'lit';
import { render } from "./app-page-admin-settings.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import AppPageElement from '../../mixins/AppPageElement.js';
import { createRef } from 'lit/directives/ref.js';
import ValidationContoller from '../../controllers/ValidationController.js';


export default class AppPageAdminSettings extends Mixin(LitElement)
  .with(LitCorkUtils, AppPageElement) {

  static get properties() {
    return {
      searchString: {type: String},
      selectedCategory: {type: String},
      categoryList: {type: Array},
      settings: {type: Array},
      editSetting: {type: Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.settingsCategory = 'adminSettings'
    this.searchString = '';
    this.selectedCategory = '';
    this.categoryList = [];
    this.settings = [];
    this.editModalRef = createRef();
    this.editSetting = {};
    this.validation = new ValidationContoller(this);

    this._injectModel('SettingsModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.pageId !== state.page ) return;

    this.AppStateModel.showLoading();
    this.showPageTitle();
    this.showBreadcrumbs();

    const d = await this.getPageData();
    if ( this.AppStateModel.showMessageIfServiceError(d) ) return;

    this.AppStateModel.showLoaded(this.pageId);

  }

  /**
   * @description Get all data needed for the page
   * @returns {Promise} - Promise that resolves to an array of data
   */
  async getPageData(){
    const d = await Promise.allSettled([this.SettingsModel.getByCategory(this.settingsCategory)]);
    this.logger.info('page data', d);
    return d;
  }

  /**
   * @description Bound to SettingsModel settings-get-by-category-update event
   * @param {Object} e - cork-app-utils event object
   * @returns
   */
  _onSettingsGetByCategoryUpdate(e) {
    if ( e.state !== 'loaded' || e.settingsCategory !== this.settingsCategory ) return;
    this._setCategoryList(e.payload);
    this.filterAndSetSettings(e.payload.map(s => ({...s})));
  }

  /**
   * @description Add hidden property to this.settings objects based on selectedCategory and searchString
   * @param {Array} settings - array of settings objects from SettingsModel
   */
  filterAndSetSettings(settings){
    if ( !settings ) settings = this.settings;
    const searchFields = ['label', 'description', 'value', 'defaultValue'];

    settings.map(setting => {
      const categoryMatch = !this.selectedCategory || setting.categories.includes(this.selectedCategory);
      const searchMatch = !this.searchString || searchFields.find(field => (setting[field] || '').toLowerCase().includes(this.searchString.toLowerCase()));
      setting.hidden = !(categoryMatch && searchMatch);
    });
    this.settings = settings;
  }

  /**
   * @description Get unique categoryies from settings and set as categoryList property
   * @param {Array} settings - array of settings objects from SettingsModel
   */
  _setCategoryList(settings){
    const labels = {
      appGlobal: 'Application Global',
    }

    const categoryList = [];
    for ( const setting of settings ){
      for ( const cat of setting.categories ){
        if ( cat === this.settingsCategory ) continue;
        if ( categoryList.find(c => c.value === cat) ) continue;
        categoryList.push({
          value: cat,
          label: labels[cat] || cat
        });
      }
    }
    categoryList.sort((a, b) => a.label.localeCompare(b.label));
    this.categoryList = categoryList;
  }

  /**
   * @description Bound to click events on setting labels. Opens edit modal
   * @param {Object} setting - The setting object that was clicked
   */
  _onSettingClick(setting){
    this.editSetting = {...setting};
    this.validation.reset();
    this.editModalRef.value.showModal();
  }

  _onEditSubmit(e){
    e.preventDefault();
    this.logger.info('submit', this.editSetting);
    this.SettingsModel.update(this.editSetting);
  }

  _onSettingsUpdateUpdate(e){
    if ( e.settingsId !== this.editSetting?.settingsId ) return;

    if ( e.state === 'loading' ){
      this.AppStateModel.showLoading();
      return;
    }


    if ( e.state === 'error' ){
      if ( e.error?.payload?.is400 ) {
        this.show();
        this.validation.showErrors(e);
        return;
      } else {
        this.closeEditModal();
        return this.AppStateModel.showMessageIfServiceError(e);
      }

    }

    if ( e.state === 'loaded' ){
      this.closeEditModal();
      this.AppStateModel.refresh();
      this.AppStateModel.showToast({message: 'Setting updated', type: 'success'});
    }

  }

  /**
   * @description Close the edit modal
   */
  closeEditModal(){
    this.editSetting = {};
    this.editModalRef.value.close();
  }

  /**
   * @description Bound to setting value input events on edit form
   * @param {String} prop - property to update on editSetting object
   * @param {*} value - value to set
   */
  _onSettingValueInput(prop, value){
    this.editSetting[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description Bound to filter change/input events
   * @param {String} prop - property to update
   * @param {*} value - value to set
   */
  _onFilterChange(prop, value){
    this[prop] = value;
    this.filterAndSetSettings();
  }

}

customElements.define('app-page-admin-settings', AppPageAdminSettings);
