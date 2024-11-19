import { html } from 'lit';

/**
 * @description Controller for handling validation errors sent from the server
 */
export default class ValidationContoller {

  constructor(host){
    this.host = host;
    host.addController(this);

    this.classes = {
      fieldError: 'validation-field-error',
      fieldErrorMessage: 'validation-field-error-message',
      errorMessage: 'validation-error-message',
    };

    this.errorMessageId = `error-message-${Math.random().toString(36).slice(2)}`;

    this.reset(true);
  }

  get hasErrorMessage(){
    return this.errorHeading || this.errorMessage;
  }

  /**
   * @description Reset the error state
   * @param {Boolean} noUpdate - if true, do not request an update from host after resetting
   */
  reset(noUpdate){
    this.corkError = {};
    this.errorsByField = {}
    this.errorHeading = '';
    this.errorMessage = '';
    if ( !noUpdate ) this.host.requestUpdate();
  }

  /**
   * @description Clear errors for a specific field
   * @param {String} field - field name
   */
  clearErrorByField(field){
    delete this.errorsByField[field];
    this.host.requestUpdate();
  }

  /**
   * @description Parse the error response from the server
   * @param {Object} res - Cork-app-utils response object
   */
  parseCorkErrorResponse(res){
    this.corkError = res;
    this.errorsByField = (this.corkError?.error?.payload?.fieldsWithErrors || []).reduce((acc, error) => {
      acc[error.fieldId] = error.errors || [];
      return acc;
    }
    , {});
    this.errorHeading = this.corkError.error?.payload?.errorHeading || '';
    this.errorMessage = this.corkError.error?.payload?.errorMessage || '';
  }

  /**
   * @description Show error state if response has validation errors.
   * This controller's render methods must be invoked in the host component's template.
   * @param {Object} res - Cork-app-utils response object
   */
  async showErrors(res){
    this.parseCorkErrorResponse(res);
    this.host.requestUpdate();
    await this.host.updateComplete;

    const errorElement = this.host.renderRoot.querySelector(`#${this.errorMessageId}`);
    if ( errorElement ) errorElement.scrollIntoView({behavior: 'smooth'});
  }

  /**
   * @description Get the error class (if any) for a field
   * @param {String} field - field name
   */
  fieldErrorClass(field){
    const errors = this.errorsByField[field];
    return errors ? this.classes.fieldError : '';
  }

  /**
   * @description Render error messages for a field (if any)
   * @param {String} field - field name
   */
  renderFieldErrorMessages(field){
    let messages = this.errorsByField[field] || [];
    if ( !messages.length ) return '';
    return html`
      <div class='${this.classes.fieldErrorMessage}'>
        ${messages.map(err => html`<div>${err.message}</div>`)}
      </div>
    `
  }

  /**
   * @description Render the overall error message if there is one
   * @returns {TemplateResult}
   */
  renderErrorMessage(){
    return html`
      <div
        id="${this.errorMessageId}"
        class="${this.classes.errorMessage} brand-textbox category-brand__background category-brand--double-decker u-space-mb"
        ?hidden=${!this.hasErrorMessage}>
        <div class='bold'>${this.errorHeading}</div>
        <p class='small'>${this.errorMessage}</p>
      </div>
    `;
  }

}
