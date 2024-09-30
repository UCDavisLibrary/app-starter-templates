/**
 * @description AppRoutes class for managing routes in a single page application
 * @property {Array} routes - array of route objects with the following properties:
 * - routeId {String} - unique identifier for the route
 * - pageId {String} - unique identifier for the page - how the main ucdlib-pages element knows which page to show
 * - pathSegment {String} - the path segment for the route (e.g. 'foo' for https://example.com/foo). '*' is a wildcard
 * - pageTitle {String} - the page title - can be dynamically set from within app by setDynamicPageTitle method
 * - breadcrumbText {String} - the breadcrumb text - can be dynamically set from within app by setDynamicPageBreadcrumbText method
 * - parent {String} - routeId of the parent route
 * - isHome {Boolean} - true if this is the home page
 *
 */
class AppRoutes {

  constructor() {
    if ( typeof window !== 'undefined' && Array.isArray(window.APP_CONFIG?.routeConfig)){
      this.routes = window.APP_CONFIG.routeConfig;
    } else {
      this.routes = [];
    }
  }

  set routes(routes) {
    if ( Array.isArray(routes) ) {
      this._routes = routes;
    } else {
      this._routes = [];
    }
  }

  get routes() {
    return this._routes;
  }

  set logger(logger) {
    if ( this._logger ) return;
    this._logger = logger;
  }

  get logger() {
    return this._logger;
  }

  /**
   * @description Log a message using cork-app-utils logger
   * browser-side only
   * @param {String} level - cork-app-utils log level
   * @param  {...any} args - log message(s)
   */
  log(level, ...args) {
    if ( this.logger ) {
      this.logger[level](...args);
    }
  }

  /**
   * @description Get all breadcrumbs for a route
   * @param {String} routeId - routeId of the route
   * @param {Boolean} excludeHome - exclude the home page from the breadcrumbs
   * @returns {Array} - breadcrumbs array in format [{text: 'Home', link: '/'}, {text: 'Foo', link: '/foo'}]
   */
  breadcrumbs(routeId, excludeHome){
    let breadcrumbs = [];

    let route = this.getByRouteId(routeId);
    if ( !route ) return breadcrumbs;

    breadcrumbs.unshift({text: this.getBreadcrumbText(routeId), link: this.getPageLink(routeId)});
    while ( route.parent ) {
      route = this.getByRouteId(route.parent);
      if ( !route ) break;
      breadcrumbs.unshift({text: this.getBreadcrumbText(route.routeId), link: this.getPageLink(route.routeId)});
    }

    if ( !excludeHome ){
      const home = this.routes.find(r => r.isHome);
      if ( home ) {
        breadcrumbs.unshift({text: this.getBreadcrumbText(home.routeId), link: '/'});
      }
    }

    return breadcrumbs;
  }

  /**
   * @description Get a page title by routeId
   * @param {String} routeId - routeId of the page
   * @returns {String} - page title
   */
  pageTitle(routeId){
    let title = '';
    const route = this.getByRouteId(routeId);
    if ( !route ) return title;

    if (typeof route.titleFunction === 'function' ) {
      try {
        title = route.titleFunction();
      } catch (e) {
        this.log('error', 'pageTitle', 'error running custom function', e);
      }
    } else {
      title = route.pageTitle;
    }
    return title;
  }

  /**
   * @description Get breadcrumb text for a page
   * @param {String} routeId
   * @returns {String}
   */
  getBreadcrumbText(routeId){
    let breadcrumb = '';
    const route = this.getByRouteId(routeId);

    if ( !route ) return breadcrumb;
    if (typeof route.breadcrumbFunction === 'function' ) {
      try {
        breadcrumb = route.breadcrumbFunction();
      } catch (e) {
        this.log('error', 'getBreadcrumbText', 'error running custom function', e);
      }
    } else {
      breadcrumb = route.breadcrumbText;
    }
    return breadcrumb;
  }

  /**
   * @description Get the path segment for a route
   * @param {String} routeId
   * @returns {String}
   */
  getPathSegment(routeId, ignoreCustomFunctions){
    let pathSegment = '';
    const route = this.getByRouteId(routeId);
    if ( !route ) return pathSegment;
    if (typeof route.pathSegmentFunction === 'function' && !ignoreCustomFunctions ) {
      try {
        pathSegment = route.pathSegmentFunction();
      } catch (e) {
        this.log('error', 'getPathSegment', 'error running custom function', e);
      }
    } else {
      pathSegment = route.pathSegment;
    }
    return pathSegment;
  }

  /**
   * @description Get all path segments for a route (including parent routes, in order)
   * @param {String} routeId - routeId of the page
   * @returns {Array} - path segments
   */
  getPathSegments(routeId, ignoreCustomFunctions){
    const segments = [];
    let route = this.getByRouteId(routeId);
    if ( !route ) return segments;
    segments.push(this.getPathSegment(routeId, ignoreCustomFunctions));
    while ( route.parent ) {
      route = this.getByRouteId(route.parent);
      if ( !route ) break;
      segments.unshift(this.getPathSegment(route.routeId, ignoreCustomFunctions));
    }
    return segments;
  }

  /**
   * @description Get a route from a path
   * @param {Array} path - array of path segments, will usuallly come from CorkAppStateModel.location.path
   * @returns {Object} - route object
   */
  getRouteFromPath(path){
    if ( !Array.isArray(path) ){
      path = path.split('/');
    }
    path = path.filter(p => p);

    if ( !path.length ) return this.routes.find(r => r.isHome);

    // find the first route that matches the path. * is a wildcard
    let parent = null;
    let route = null;
    for ( let p of path ) {
      route = this.routes.find(r => r.pathSegment === p && r.parent == parent);
      if ( !route ) {
        route = this.routes.find(r => r.pathSegment === '*' && r.parent == parent);
      }
      if ( !route ) return null;
      parent = route.routeId;
    }

    return route;
  }

  /**
   * @description Get a page link
   * @param {String} routeId - routeId of the page
   * @returns
   */
  getPageLink(routeId){
    const page = this.getByRouteId(routeId);
    if ( !page ) return '';
    const segments = this.getPathSegments(routeId);
    return `/${segments.join('/')}`;
  }

  /**
   * @description Get a page record by pageId
   * @param {String} pageId
   */
  getByPageId(pageId) {
    const page = this.routes.find(route => route.pageId === pageId);
    if ( !page ){
      this.log('warn', 'getByPageId', 'page not found', pageId);
    }
    return page;
  }

  /**
   * @description Get a page record by routeId
   * @param {String} routeId - routeId of the page
   * @returns
   */
  getByRouteId(routeId) {
    const page = this.routes.find(route => route.routeId === routeId);
    if ( !page ){
      this.log('warn', 'getByRouteId', 'page not found', routeId);
    }
    return page;
  }

  /**
   * @description Set a dynamic page title
   * @param {String} routeId - routeId of the page
   * @param {Function} titleFunction - function that returns a string
   * @returns {Boolean} - true if successful, false if not
   */
  setDynamicPageTitle(routeId, titleFunction) {
    const route = this.getByRouteId(routeId);
    if ( !route ) return false;
    route.titleFunction = titleFunction;
    return true;
  }

  /**
   * @description Set a dynamic page breadcrumb text
   * @param {String} routeId
   * @param {Function} breadcrumbFunction
   * @returns
   */
  setDynamicPageBreadcrumbText(routeId, breadcrumbFunction) {
    const route = this.getByRouteId(routeId);
    if ( !route ) return false;
    route.breadcrumbFunction = breadcrumbFunction;
    return true;
  }

  /**
   * @description Set a dynamic page path segment
   * @param {String} routeId
   * @param {Function} pathSegmentFunction - function that returns a string
   * @returns
   */
  setDynamicPagePathSegment(routeId, pathSegmentFunction) {
    const route = this.getByRouteId(routeId);
    if ( !route ) return false;
    route.pathSegmentFunction = pathSegmentFunction;
    return true;
  }

  /**
   * @description - Get the top level route strings for use in the middleware. e.g.
   * ['foo', 'bar']
   * where htpps://example.com/foo and https://example.com/bar are routes handled by the spa
   * @returns {Array}
   */
  getSpaMiddleWareAppRoutes(){
    return this.routes.filter(r => !r.parent && !r.isHome).map(r => r.pathSegment);
  }

}

export default new AppRoutes();
