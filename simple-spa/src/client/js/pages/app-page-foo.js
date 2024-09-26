import { LitElement, html } from 'lit';
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

  _onEditClick(item){}

  _onDeleteClick(item){
    this.AppStateModel.showDialogModal({
      title: 'Delete Foo',
      content: html`
        <p>Are you sure you want to delete foo item: <strong>${item.name}</strong>?</p>
        <p>This action cannot be undone.</p>
        `,
      actions: [
        {text: 'Delete', value: 'delete-foo', color: 'double-decker'},
        {text: 'Cancel', value: 'cancel'}
      ],
      data: {item}
    });
  }

  _onAppDialogAction(e){
    if( e.action === 'delete-foo' ) {
      console.log('Delete foo item', e.data.item);
    }
  }

}

customElements.define('app-page-foo', AppPageFoo);
