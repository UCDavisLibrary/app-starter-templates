import { LitElement } from 'lit';
import { render } from "./app-page-home.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import AppPageElement from '../mixins/AppPageElement.js';

export default class AppPageHome extends Mixin(LitElement)
  .with(LitCorkUtils, AppPageElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.pageId !== state.page ) return;
    // this.AppStateModel.showLoading();

    this.showPageTitle();
    this.showBreadcrumbs();

    // const d = await this.getPageData();
    // const hasError = d.some(e => e.state === 'error');
    // if ( !hasError ) this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Get any data required for rendering this page
   */
  async getPageData(){
    const promises = [];
    //promises.push(this.YourModel.getData());
    const resolvedPromises = await Promise.all(promises);
    return resolvedPromises;
  }

}

customElements.define('app-page-home', AppPageHome);
