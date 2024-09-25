import { LitElement } from 'lit';
import { render, styles } from "./app-page-alt-state.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MutationObserverController } from "@ucd-lib/theme-elements/utils/controllers/index.js";

/**
 * @description This page displays app states other than loaded. e.g. loading, error, etc.
 * It should be controled via AppStateModel methods
 * - AppStateModel.showLoading()
 * - AppStateModel.showError()
 * - AppStateModel.showLoaded()
 * }
 */
export default class AppPageAltState extends Mixin(LitElement)
.with(LitCorkUtils) {

  static get properties() {
    return {
      state: {type: String},
      errorHeading: {type: String},
      errorMessage: {type: String},
      serverLogId: {type: String},
      isVisible: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.state = 'loading';
    this.errorHeading = 'An Error Occurred';
    this.errorMessage = '';
    this.serverLogId = '';

    this.isVisible = false;
    new MutationObserverController(this, {attributes : true, attributeFilter : ['style']});

    this._injectModel('AppStateModel');
  }

  _onPageStateUpdate(e) {

    const { state } = e;
    if ( !['error', 'loading'].includes(state)){
      this.state = 'loading';
    } else {
      this.state = state;
    }
    if ( this.state === 'error' ) {
      this.errorHeading = e.errorHeading || 'An Error Occurred';
      this.errorMessage = e.errorMessage || '';
      this.serverLogId = e.serverLogId || '';
    }
  }

  /**
   * @description Fires when style changes (aka when this page is shown/hidden)
   * Delays showing loading screen, so we don't get a jarring flash of content for quick loads
   */
  _onChildListMutation(){
    setTimeout(() => {
      this.isVisible = this.style.display != 'none';
    }, 10);
  }
}

customElements.define('app-page-alt-state', AppPageAltState);
