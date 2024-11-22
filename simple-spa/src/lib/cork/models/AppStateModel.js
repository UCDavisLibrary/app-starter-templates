import {AppStateModel} from '@ucd-lib/cork-app-state';
import AppStateStore from '../stores/AppStateStore.js';
import { appConfig } from '../../appGlobals.js';
import appRoutes from '../../utils/appRoutes.js';

/**
 * @description Model for handling generic app state, such as routing
 */
class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    this.store = AppStateStore;

    if ( appConfig.auth?.requireAuth ) {
      this.inject('AuthModel');
    }
  }

  /**
   * @description Sets the current route state
   * @param {Object} update - Route state - Returned in AppStateUpdate
   * @returns
   */
  set(update) {

    if ( this.AuthModel && this.AuthModel.logOutRequested(update.location) ){
      this.showLoading();
      this.AuthModel.logout();
      return;
    }
    this.stripStateFromHash(update);
    this._setPage(update);
    this.setBreadcrumbs(false, update);
    this.closeNav();

    let res = super.set(update);

    return res;
  }

  /**
   * @description Fire an app-state-update event for the current location
   */
  refresh(){
    const state = this.store.data;
    const pageId = state?.page;
    const routeId = state?.routeId;
    if ( !routeId ){
      this.showError('Page not found');
    }
    this.store.emit('app-route-id-update', {pageId, routeId});
    this.store.emit(this.store.events.APP_STATE_UPDATE, state);
  }

  /**
   * @description Sets page id for a url location,
   * where page id corresponds to the id attribute of a child of ucdlib-pages in app-main.tpl.js
   * @param {Object} update
   */
  _setPage(update){
    if ( !update ) return;
    let pageId = 'page-not-loaded';
    let routeId = '';
    const route = appRoutes.getRouteFromPath(update.location.path);
    if ( route ) {
      pageId = route.pageId;
      routeId = route.routeId;
    } else {
      this.showError('Page not found');
    }

    this.store.emit('app-route-id-update', {pageId, routeId});
    update.page = pageId;
    update.routeId = routeId;

  }

  /**
   * @description Updates title of page. Usually called from a page's _onAppStateUpdate method.
   * @param {String|Object} title Page title. If object passed, must be in format {show: bool, text: string}
   */
  setTitle(title){
    const t = {
      show: false,
      text: ''
    };
    if ( typeof title === 'string' ){
      t.show = true;
      t.text = title;
    } else if ( typeof title === 'object' ) {
      t.show = title.show === undefined ? true : title.show;
      t.text = title.text ? title.text : '';
    }
    this.store.emit('page-title-update', t);
  }

  /**
   * @description Remove extraneous state values from hash set by keycloak.
   * It interferes with the app's routing.
   * @param {*} update
   * @returns
   */
  stripStateFromHash(update){
    if ( !update || !update.location || !update.location.hash ) return;
    let hash = new URLSearchParams(update.location.hash);
    const toStrip = ['state', 'session_state', 'code'];
    let replace = false;
    for (const key of toStrip) {
      if ( hash.has(key) ) {
        hash.delete(key);
        replace = true;
      }
    }
    if ( !replace ) return;
    hash = hash.toString().replace('=','');
    update.location.hash = hash;
  }

  /**
   * @description Sets breadcrumbs
   * @param {Object|Array} breadcrumbs If array, must be in format [{text: 'Home', link: '/'}, {text: 'Foo', link: '/foo'}]
   * If object, must be in format {show: bool, breadcrumbs: array}
   */
  setBreadcrumbs(breadcrumbs){
    const b = {
      show: false,
      breadcrumbs: []
    }
    if ( Array.isArray(breadcrumbs) ) {
      b.breadcrumbs = breadcrumbs;
      b.show = true;
    } else if ( typeof breadcrumbs === 'object' ) {
      b.show = breadcrumbs.show === undefined ? true : breadcrumbs.show;
      b.breadcrumbs = breadcrumbs.breadcrumbs ? breadcrumbs.breadcrumbs : [];
    }
    for ( const crumb of b.breadcrumbs ) {
      crumb.text = crumb.text || '';
      crumb.link = crumb.link || '';
    }

    this.store.emit('breadcrumb-update', b);
  }

  /**
   * @description Show dismissable alert banner at top of page. Will disappear on next app-state-update event
   * @param {Object|String} options Alert message if string, config if object:
   * {message: 'alert!'
   * brandColor: 'double-decker'
   * }
   */
  showAlertBanner(options){
    if ( typeof options === 'string' ){
      options = {message: options};
    }
    this.store.emit('alert-banner-update', options);
  }

  /**
   * @description Show the app's loading page
   */
  showLoading(){
    this.store.emit('page-state-update', {state: 'loading'});
  }

  /**
   * @description Show the app's error page
   * @param {String} errorMessage - Optional. The error message to display.
   * @param {String} errorHeading - Optional. The error heading to display.
   * @param {String} serverLogId - Optional. The server log id to display.
   */
  showError(errorMessage, errorHeading, serverLogId){
    this.store.emit('page-state-update', {state: 'error', errorMessage, errorHeading, serverLogId});
  }

  /**
   * @description Checks if there is an error in an array of cork-app-utils service response objects
   * Displays error page if found
   * Should be used in a page's _onAppStateUpdate method. e.g.
   * async _onAppStateUpdate(state) {
   *   this.AppStateModel.showLoading();
   *   const d = await this.getPageData();
   *   if ( this.AppStateModel.showMessageIfServiceError(d) ) return;
   *   this.AppStateModel.showLoaded(this.id);
   * }
   * @param {Array} responseArray Array of cork-app-utils service response objects from a Promise.allSettled call
   * @param {Object} kwargs Object with the following optional properties:
   * - errorMessage {String} - Custom error message to display
   * - errorHeading {String} - Custom error heading to display
   */
  showMessageIfServiceError(responseArray, kwargs={}){
    const customErrorMessage = kwargs.errorMessage;
    const customErrorHeading = kwargs.errorHeading;

    // handle a single cork-app-utils response object
    if ( !Array.isArray(responseArray) ) responseArray = [{value: responseArray}];

    // flatten array of responses
    // e.g. if one of the array elements is also an array from a Promise.allSettled call
    responseArray = responseArray.reduce((acc, val) => {
      if ( Array.isArray(val?.value) ){
        acc.push(...val.value);
      } else {
        acc.push(val);
      }
      return acc;
    }, []);

    // extract errors from responses
    const errors = responseArray.filter(r => r.value.state === 'error').map(r => r.value);
    if ( !errors.length ) return false;

    // look for a meaningful error message in the response
    // as formatted by apiUtils server methods
    const meaningfulError = errors.find(e => e?.error?.payload?.errorMessage || e?.error?.payload?.errorHeading);
    if ( meaningfulError ){
      this.showError(
        customErrorMessage || meaningfulError.error.payload.errorMessage,
        customErrorHeading || meaningfulError.error.payload.errorHeading,
        meaningfulError.error.payload.serverLogId
      );
      return true;
    }

    // handle standard responses
    const standardResponses = [
      [404, (e) => `Service endpoint not found: ${e.error?.response?.url || ''}`],
      [401, () => 'You need to authenticate to view this page or perform this action'],
      [403, () => 'You are not authorized to view this page or perform this action'],
    ];
    for ( const sr of standardResponses ) {
      const error = errors.find(e => e?.error?.response?.status === sr[0]);
      if ( error ){
        this.showError(customErrorMessage || sr[1](error), customErrorHeading);
        return true;
      }
    }

    this.showError(customErrorMessage, customErrorHeading);
    return true;

  }

  /**
   * @description Return app to a non-error/non-loading status
   * @param {String} page - The page to show.
   */
  showLoaded(page){
    if ( page ){
      this.store.emit('page-state-update', {state: 'loaded', page});
    } else {
      console.warn('showLoaded called without page argument');
    }

  }

  /**
   * @description Close the app's primary nav menu
   */
  closeNav(){
    let ele = document.querySelector('ucd-theme-header');
    if ( ele ) {
      ele.close();
    }
    ele = document.querySelector('ucd-theme-quick-links');
    if ( ele ) {
      ele.close();
    }
  }

  /**
   * @description Get URL path at the given index
   * @param {Number} index - Optional. The index of the path to get. Defaults to 0.
   * e.g. https://foo.edu/0/1/2/3
   * @param {Object} update - Optional. The app state to use. Defaults to this.store.data.
   * @returns
   */
  getPathByIndex( index, update ){
    if ( !update ) update = this.store.data;
    if ( !index ) index = 0;
    return update?.location?.path?.[index];
  }

  /**
   * @description Show a modal dialog box.
   * To listen for the action event, add the _onDialogAction method to your element and then filter on e.action
   * @param {Object} options Dialog object with the following properties:
   * - title {TemplateResult} - The title of the dialog (optional)
   * - content {TemplateResult} - The html content of the dialog (optional, but should probably be included)
   * - actions {Array} - Array of objects with the following properties:
   *  - text {String} - The text of the button
   *  - value {String} - The action slug that is emitted when button is clicked
   *  - invert {Boolean} - Invert the button color (optional)
   *  - color {String} - The brand color string of the button (optional)
   * - data {Object} - Any data to pass along in the action event (optional)
   *
   * If the actions array is empty, a 'Dismiss' button will be added automatically
   */
  showDialogModal(options={}){
    if ( !options.actions ) {
      options.actions = [{text: 'Dismiss', action: 'dismiss'}];
    }
    if ( !options.data ) {
      options.data = {};
    }
    if ( !options.title ) {
      options.title = '';
    }
    if ( !options.content ) {
      options.content = '';
    }
    this.store.emit('app-dialog-open', options);
  }

  /**
   * @description Show dismissable toast banner in popup. Will disappear on next app-state-update event
   * @param {Object} options Toast object with the following properties:
   * - message {String} - The message to display
   * - type {String} - The type of toast. Options: 'info', 'error', 'success'
   */
  showToast(option){
    if ( !option.message ){
      this.logger.warn('showToast called without message');
      return;
    }
    this.store.emit('app-toast-update', option);
  }

  /**
   * @description Dismissing all toasts in the queue
   */
  dismissToast(){
    let dismissMessage = "Toast Dismissed";
    this.store.emit('app-toast-dismiss', {message: dismissMessage});
  }

}

const model = new AppStateModelImpl();
export default model;

