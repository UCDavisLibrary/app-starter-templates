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

}
