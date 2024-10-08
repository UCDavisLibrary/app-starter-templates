import { LitElement } from 'lit';
import { render } from "./app-dialog-modal.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { createRef } from 'lit/directives/ref.js';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

/**
 * @description Generic dialog modal for app-wide use
 * See AppStateModel.showDialogModal() for usage and accepted parameters
 */
export default class AppDialogModal extends Mixin(LitElement)
.with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      modalTitle: {type: String},
      modalContent: {type: String},
      actions: {type: Array},
      data: {type: Object}
    }
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.modalTitle = '';
    this.modalContent = '';
    this.actions = [];
    this.data = {};

    this.dialogRef = createRef();

    this._injectModel('AppStateModel');
  }

  /**
   * @description Bound to AppStateModel dialog-open event
   * Will open the dialog modal with the provided title, content, and actions
   */
  _onAppDialogOpen(e){
    this.modalTitle = e.title;
    this.modalContent = e.content;
    this.actions = e.actions;
    this.data = e.data;

    this.logger.info('Opening dialog modal', e);
    this.dialogRef.value.showModal();
  }

  /**
   * @description Bound to dialog button(s) click event
   * Will emit a dialog-action AppStateModel event with the action value and data
   * @param {String} action - The action value to emit
   */
  _onButtonClick(action){
    this.dialogRef.value.close();
    this.logger.info(`Dialog action: ${action}`, this.data, `use callback: _onAppDialogAction`);
    this.AppStateModel.emit('app-dialog-action', {action, data: this.data});
  }

}

customElements.define('app-dialog-modal', AppDialogModal);
