import { LitElement } from 'lit';
import { render } from "./app-page-home.tpl.js";
import { LitCorkUtils, Mixin } from "../../../lib/appGlobals.js";

export default class AppPageHome extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.setTitle('Home Page');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);
  }

}

customElements.define('app-page-home', AppPageHome);
