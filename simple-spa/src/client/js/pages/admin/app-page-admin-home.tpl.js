import { html } from 'lit';


export function render() {
return html`
  <div class='l-container'>
    <ul class='list--arrow'>
      ${this.links.map(link => html`
        <li><a href=${link.href}>${link.text}</a></li>
      `)}
    </ul>
  </div>


`;}
