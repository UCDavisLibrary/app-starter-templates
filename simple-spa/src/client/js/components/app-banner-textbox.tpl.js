import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function render() {
return html`
  <div ?hidden=${!this.settings.text} class='brand-textbox category-brand__background category-brand--${this.settings.color}'>
    ${unsafeHTML(this.settings.text)}
  </div>
`;}
