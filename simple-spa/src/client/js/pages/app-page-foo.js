import { LitElement, html } from 'lit';
import { render } from "./app-page-foo.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import AppPageElement from '../mixins/AppPageElement.js';
import SettingsController from '../controllers/SettingsController.js';
import CorkModelController from '../controllers/CorkModelController.js';


export default class AppPageFoo extends Mixin(LitElement)
  .with(LitCorkUtils, AppPageElement) {


  static get properties() {
    return {
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.fooData = [];

    this.settings = new SettingsController(this);
    this.foo = new CorkModelController(
      this, 'FooModel', [
        {property: 'list', method: 'list', defaultValue: []}
      ]);

    this._injectModel('FooModel');

  }

  /**
   * @description bound to AppStateModel app-state-update event
   * @param {Object} state - AppStateModel state
   */
  async _onAppStateUpdate(state) {
    if ( this.pageId !== state.page ) return;

    this.AppStateModel.showLoading();
    this.showPageTitle();
    this.showBreadcrumbs();

    const d = await this.getPageData();

    if ( this.AppStateModel.showMessageIfServiceError(d) ) return;
    this.AppStateModel.showLoaded(this.pageId);

  }

  /**
   * @description Get any data required for rendering this page
   */
  async getPageData(){
    const promises = [
      this.foo.list.get(),
      this.settings.get()
    ];
    return Promise.allSettled(promises);
  }

  _onFooDeleteUpdate(e) {
    if ( e.state === 'error' ){
      return this.AppStateModel.showMessageIfServiceError(e, {errorHeading: 'Error deleting foo item'});
    }
    this.AppStateModel.showToast({
      message: 'Foo item deleted',
      type: 'success'
    });
    this.AppStateModel.refresh();
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
      this.FooModel.delete(e.data.item.id);
    }
  }

}

customElements.define('app-page-foo', AppPageFoo);
