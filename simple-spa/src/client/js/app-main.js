import { LitElement } from 'lit';
import { render } from "./app-main.tpl.js";

// brand components
import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';

// icons
import '@fortawesome/fontawesome-free/js/all.js';

// global event bus and model registry
import "@ucd-lib/cork-app-utils";

// app globals - should be loaded after cork-app-utils
import { appConfig, LitCorkUtils, Mixin } from "../../lib/appGlobals.js";

// init app state model
import AppStateModel from "../../lib/cork/models/AppStateModel.js";
AppStateModel.init(appConfig.routes);

// registry of app page bundles - pages are dynamically loaded on appStateUpdate
import bundles from "./pages/bundles/index.js";

/**
 * @class AppMain
 * @description The main app web component, which controls routing and other app-level functionality.
 */
export default class AppMain extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      pageTitle: {type: String},
      showPageTitle: {type: Boolean},
      breadcrumbs: {type: Array},
      showBreadcrumbs: {type: Boolean},
      userIsAuthenticated: {type: Boolean},
      appTitle: {type: String},
      pageIsLoaded: {state: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.loadedBundles = {};

    this.pageTitle = '';
    this.showPageTitle = false;
    this.breadcrumbs = [];
    this.showBreadcrumbs = false;
    this.userIsAuthenticated = false;
    this.appTitle = appConfig.title;
    this.pageIsLoaded = false;

    this._notLoadedPageId = 'page-not-loaded';

    this._injectModel('AppStateModel');
    this.page = this.AppStateModel.store.defaultPage;
  }

  /**
   * @description LitElement lifecycle method called when element is about to update
   * @param {Map} props - changed properties
   */
  willUpdate(props) {
    if ( props.has('page') ) {
      this.pageIsLoaded = this.page !== this._notLoadedPageId;
    }
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Custom element lifecyle event
   * Hide the loading screen and show the app when the element is connected
   */
  connectedCallback(){
    super.connectedCallback();
    this.style.display = 'block';
    document.querySelector('#whole-screen-load').style.display = 'none';
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    const { page } = state;

    const bundle = this._getBundleName(page);
    let bundleAlreadyLoaded = true;

    // dynamically load code
    if ( !this.loadedBundles[bundle] ) {
      bundleAlreadyLoaded = false;
      //this.AppStateModel.showLoading(e.page);
      this.loadedBundles[bundle] = this._loadBundle(bundle, page);

    }
    await this.loadedBundles[bundle];

    // requested page element might also be listening to app-state-update
    // in which case we need to fire it again
    if ( !bundleAlreadyLoaded ){
      this.AppStateModel.refresh();
      //AuthModel._onAuthRefreshSuccess();
    }

    this.page = page;
    window.scroll(0,0);
  }

  /**
   * @description Listens for page-title-update event from AppStateModel
   * Sets the page title and whether or not to show it
   * @param {Object} title - {show: bool, text: string}
   */
  _onPageTitleUpdate(title) {
    const { show, text } = title;
    this.pageTitle = text;
    this.showPageTitle = show;
  }

  /**
   * @description Listens for breadcrumb-update event from AppStateModel
   * Sets the page breadcrumbs and whether or not to show them
   * @param {Object} breadcrumbs - {show: bool, breadcrumbs: [text: string, link: string]}
   */
  _onBreadcrumbUpdate(breadcrumbs) {
    const show = breadcrumbs.show;
    breadcrumbs = breadcrumbs.breadcrumbs;
    this.breadcrumbs = breadcrumbs;
    this.showBreadcrumbs = show;
  }

  /**
   * @description Get name of bundle a page element is in
   * @param {String} page
   * @returns {String}
   */
  _getBundleName(page){
    for (const bundle in bundles) {
      if ( bundles[bundle].includes(page) ){
        return bundle;
      }
    }
    return '';
  }

  /**
   * @description code splitting done here
   *
   * @param {String} bundle bundle to load
   * @param {String} page page to load. Just used for error logging.
   *
   * @returns {Promise}
   */
  _loadBundle(bundle, page='') {

    if( bundle == 'all' ) {
      return import(/* webpackChunkName: "pages" */ "./pages/bundles/all.js");
    }
    console.warn(`AppMain: bundle ${bundle} not found for page ${page}. Check pages/bundles/index.js`);
    return false;
  }

}

customElements.define('app-main', AppMain);
