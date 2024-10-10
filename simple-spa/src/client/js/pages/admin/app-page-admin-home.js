import { LitElement } from 'lit';
import { render } from "./app-page-admin-home.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import AppPageElement from '../../mixins/AppPageElement.js';

export default class AppPageAdminHome extends Mixin(LitElement)
  .with(LitCorkUtils, AppPageElement) {

  static get properties() {
    return {
      links: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this._setLinks();
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.pageId !== state.page ) return;
    this.showPageTitle();
    this.showBreadcrumbs();
  }

  _setLinks(){
    const nav = document.querySelector('ucd-theme-quick-links');
    if ( nav ){
      this.links = nav._links;
    } else {
      this.links = [];
    }

  }

}

customElements.define('app-page-admin-home', AppPageAdminHome);
