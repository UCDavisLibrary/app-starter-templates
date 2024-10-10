import { LitElement } from 'lit';
import { render } from "./app-page-admin-settings.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import AppPageElement from '../../mixins/AppPageElement.js';

export default class AppPageAdminSettings extends Mixin(LitElement)
  .with(LitCorkUtils, AppPageElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

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

    //const d = await this.getPageData();
    //if ( this.AppStateModel.showMessageIfServiceError(d) ) return;

    this.AppStateModel.showLoaded(this.pageId);

  }

}

customElements.define('app-page-admin-settings', AppPageAdminSettings);
