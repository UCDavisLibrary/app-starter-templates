import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

export function render() {
return html`
  <div class='l-container'>
    ${renderFilters.call(this)}
    ${renderSettings.call(this)}
    ${renderEditModal.call(this)}
  </div>
`;}

function renderEditModal(){
  const s = this.editSetting;
  const id = `setting-edit--${s.settingsId}`;
  const defaultValueId = `${id}-default-value`;
  const value = s.useDefaultValue ? s.defaultValue : s.value;

  let input = html`
  <input
    id="${id}"
    type=${s.inputType}
    .value=${value}
    ?disabled=${s.useDefaultValue}
    @input=${(e) => this._onSettingValueInput('value', e.target.value)}
     />
  `;
  if ( s.inputType == 'textarea' ) {
    input = html`
      <textarea
        id="${id}"
        .value=${value}
        ?disabled=${s.useDefaultValue}
        @input=${(e) => this._onSettingValueInput('value', e.target.value)}
        rows="5"
      ></textarea>
    `;
  }

  return html`
    <dialog ${ref(this.editModalRef)}>
      <form @submit=${this._onEditSubmit}>
        <h2 class='heading--highlight u-space-mb'>${s.label}</h2>
        ${this.validation.renderErrorMessage()}
        <div class='field-container ${this.validation.fieldErrorClass('useDefaultValue')}' ?hidden=${!s.defaultValue}>
          <div class='checkbox'>
            <input type="checkbox"
                id="${defaultValueId}"
                @input=${() => this._onSettingValueInput('useDefaultValue', !s.useDefaultValue)}
                .checked=${s.useDefaultValue} />
            <label for="${defaultValueId}">Use default value</label>
          </div>
          ${this.validation.renderFieldErrorMessages('useDefaultValue')}
        </div>
        <div class='field-container ${this.validation.fieldErrorClass('value')}'>
          <label for="${id}">${s.useDefaultValue ? 'Default Setting Value' : 'Setting Value'}</label>
          ${input}
          ${this.validation.renderFieldErrorMessages('value')}
        </div>
        <div class='alignable-promo__buttons'>
          <div class='category-brand--secondary'>
            <button class='btn btn--primary' type='submit'>Save</button>
          </div>
          <div class='category-brand--secondary'>
            <button class='btn btn--invert' type='button' @click=${() => this.closeEditModal()}>Close</button>
          </div>
        </div>
      </form>
    </dialog>
  `;
}

function renderSettings(){
  return html`
    ${this.settings.filter(s => !s.hidden).map(setting => html`
      <div class='u-space-mb--small'>
        <div class='bold primary'><a class='underline-hover' @click=${() => this._onSettingClick(setting)}>${setting.label}</a></div>
        <div class='grey small'>${setting.description}</div>
      </div>
    `)}
  `;
}

function renderFilters(){
  return html`
    <div class='l-3col grid--simple-override u-space-mb'>
      <div class='l-first'>
        <div class='field-container'>
          <label>Category</label>
          <select
            @change=${e => this._onFilterChange('selectedCategory', e.target.value)}
            .value=${this.selectedCategory}>
            <option value='' ?selected=${!this.selectedCategory}>All</option>
            ${this.categoryList.map(cat => html`
              <option value=${cat.value} ?selected=${this.selectedCategory === cat.value}>${cat.label}</option>
            `)}
          </select>
        </div>
      </div>
      <div class='l-second'>
        <div class='field-container'>
          <label>Keyword</label>
          <input
            type='text'
            @input=${e => this._onFilterChange('searchString', e.target.value)}
            .value=${this.searchString}
          />
        </div>
      </div>
    </div>
  `;
}
