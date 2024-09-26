import appRoutes from "../../../lib/utils/appRoutes.js";

export default (superClass) => class extends superClass {

  // disable the shadow dom
  // all styles should be placed in app scss files
  createRenderRoot() {
    return this;
  }

  /**
   * @description return the page id, which is used by parent ucdlib-pages element to show/hide pages
   */
  get pageId() {
    return this.getAttribute('page-id');
  }

  /**
   * @description Show the page title
   * @param {String|Function} title - Page title
   *  - undefined: Page Title defined in appRoutes class
   *  - String: Static page title
   *  - Function: Dynamic page title
   * @returns
   */
  showPageTitle(title){
    if ( typeof title === 'string' ){
      this.AppStateModel.setTitle(title);
      return;
    } else if ( typeof title === 'function' ){
      appRoutes.setDynamicPageTitle(this.pageId, title);
    }
    const pageTitle = appRoutes.pageTitle(this.pageId);
    this.logger.debug('Setting Page Title', pageTitle);
    this.AppStateModel.setTitle(pageTitle);
  }

  /**
   * @description Hide the page title
   */
  hidePageTitle(){
    this.AppStateModel.setTitle({show: false});
  }

  showBreadcrumbs(){
    const page = appRoutes.getByPageId(this.pageId);
    if ( !page ) return;

    let excludeHome = false;
    if ( page.isHome ){
      excludeHome = true;
    }
    const breadcrumbs = appRoutes.breadcrumbs(this.pageId, excludeHome);
    this.logger.debug('Breadcrumbs', breadcrumbs);
    this.AppStateModel.setBreadcrumbs(breadcrumbs);
  };

  hideBreadcrumbs(){
    this.AppStateModel.setBreadcrumbs(false);
  }

}
