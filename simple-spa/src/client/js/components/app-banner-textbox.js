import { LitElement } from 'lit';
import { render } from "./app-banner-textbox.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";
import SettingsController from '../controllers/SettingsController.js';

/**
 * @description App component for displaying a site-wide banner textbox
 */
export default class AppBannerTextbox extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {

    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    const settingsMapper = [
      {setting: 'global.banner.color', property: 'color', defaultValue: 'double-decker'},
      {setting: 'global.banner.text', property: 'text'}
    ];
    this.settings = new SettingsController(this, settingsMapper, 'appGlobal');

    this._injectModel('AppStateModel');
  }

  async _onAppStateUpdate() {
    const r = await this.settings.get();
    if ( r.state === 'error' ){
      this.logger.error('Unable to get settings', r.error);
    }
  }

}

customElements.define('app-banner-textbox', AppBannerTextbox);
