import { LitElement } from 'lit';
import { render } from "./app-page-foo.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";


export default class AppPageFoo extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {


  static get properties() {
    return {
      fooData: {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.fooData = [];

    this._injectModel('AppStateModel', 'FooModel');
  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.id !== state.page ) return;

    this.AppStateModel.showLoading();
    this.AppStateModel.setTitle('Foo');

    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.foo
    ];
    this.AppStateModel.setBreadcrumbs(breadcrumbs);

    const d = await this.getPageData();

    if ( this.AppStateModel.showMessageIfServiceError(d) ) return;
    this.AppStateModel.showLoaded(this.id);

  }

  /**
   * @description Get any data required for rendering this page
   */
  async getPageData(){
    const promises = [
      this.FooModel.list()
    ];
    return Promise.allSettled(promises);
  }

  _onFooListUpdate(e) {
    if ( e.state === 'loaded' ) {
      this.fooData = e.payload;
    }
  }

}

customElements.define('app-page-foo', AppPageFoo);
