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
   * @description Get all breadcrumbs for a page
   * @param {String} pageId
   * @param {Boolean} excludeHome - exclude the home page from the breadcrumbs
   * @returns {Array} - breadcrumbs array in format [{text: 'Home', link: '/'}, {text: 'Foo', link: '/foo'}]
   */
  breadcrumbs(pageId, excludeHome){
    let breadcrumbs = [];

    let page = this.getByPageId(pageId);
    if ( !page ) return breadcrumbs;

    breadcrumbs.unshift({text: this.getBreadcrumbText(pageId), link: this.getPageLink(pageId)});
    while ( page.parent ) {
      page = this.getByPageId(page.parent);
      if ( !page ) break;
      breadcrumbs.unshift({text: this.getBreadcrumbText(page.pageId), link: this.getPageLink(page.pageId)});
    }

    if ( !excludeHome ){
      const home = this.routes.find(r => r.isHome);
      if ( home ) {
        breadcrumbs.unshift({text: this.getBreadcrumbText(home.pageId), link: '/'});
      }
    }

    return breadcrumbs;
  }

  /**
   * @description Get a page title by pageId
   * @param {String} pageId - pageId of the page
   * @returns {String} - page title
   */
  pageTitle(pageId){
    let title = '';
    const page = this.getByPageId(pageId);
    if ( !page ) return title;

    if (typeof page.titleFunction === 'function' ) {
      try {
        title = page.titleFunction();
      } catch (e) {
        this.log('error', 'pageTitle', 'error running custom function', e);
      }
    } else {
      title = page.pageTitle;
    }
    return title;
  }

  /**
   * @description Get breadcrumb text for a page
   * @param {String} pageId
   * @returns {String}
   */
  getBreadcrumbText(pageId){
    let breadcrumb = '';
    const page = this.getByPageId(pageId);

    if ( !page ) return breadcrumb;
    if (typeof page.breadcrumbFunction === 'function' ) {
      try {
        breadcrumb = page.breadcrumbFunction();
      } catch (e) {
        this.log('error', 'getBreadcrumbText', 'error running custom function', e);
      }
    } else {
      breadcrumb = page.breadcrumbText;
    }
    return breadcrumb;
  }

  /**
   * @description Get the path segment for a page
   * @param {String} pageId
   * @returns {String}
   */
  getPathSegment(pageId){
    let pathSegment = '';
    const page = this.getByPageId(pageId);
    if ( !page ) return pathSegment;
    if (typeof page.pathSegmentFunction === 'function' ) {
      try {
        pathSegment = page.pathSegmentFunction();
      } catch (e) {
        this.log('error', 'getPathSegment', 'error running custom function', e);
      }
    } else {
      pathSegment = page.pathSegment;
    }
    return pathSegment;
  }

  /**
   * @description Get all path segments for a page (including parent pages, in order)
   * @param {String} pageId
   * @returns {Array} - path segments
   */
  getPathSegments(pageId){
    const segments = [];
    let page = this.getByPageId(pageId);
    if ( !page ) return segments;
    segments.push(this.getPathSegment(pageId));
    while ( page.parent ) {
      page = this.getByPageId(page.parent);
      if ( !page ) break;
      segments.unshift(this.getPathSegment(page.pageId));
    }
    return segments;
  }

  /**
   * @description Get a page link
   * @param {*} pageId
   * @returns
   */
  getPageLink(pageId){
    const page = this.getByPageId(pageId);
    if ( !page ) return '';
    const segments = this.getPathSegments(pageId);
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
   * @description Set a dynamic page title
   * @param {String} pageId - pageId of the page
   * @param {Function} titleFunction - function that returns a string
   * @returns {Boolean} - true if successful, false if not
   */
  setDynamicPageTitle(pageId, titleFunction) {
    const page = this.getByPageId(pageId);
    if ( !page ) return false;
    page.titleFunction = titleFunction;
    return true;
  }

  /**
   * @description Set a dynamic page breadcrumb text
   * @param {String} pageId
   * @param {Function} breadcrumbFunction
   * @returns
   */
  setDynamicPageBreadcrumbText(pageId, breadcrumbFunction) {
    const page = this.getByPageId(pageId);
    if ( !page ) return false;
    page.breadcrumbFunction = breadcrumbFunction;
    return true;
  }

  /**
   * @description Set a dynamic page path segment
   * @param {String} pageId
   * @param {Function} pathSegmentFunction - function that returns a string
   * @returns
   */
  setDynamicPagePathSegment(pageId, pathSegmentFunction) {
    const page = this.getByPageId(pageId);
    if ( !page ) return false;
    page.pathSegmentFunction = pathSegmentFunction;
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
