import { html } from 'lit';

export function render() {
return html`
  <div class='l-container'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <p>${this.settings.fooDescription}</p>
        ${this.fooData.length ? html`
          <div>
            ${this.fooData.map(item => html`
              <div class='flex flex--align-center u-space-my--small'>
                <div style='font-size:.7rem;'>
                  <a
                    title='Edit'
                    @click=${() => this._onEditClick(item)}
                    class='icon-link icon-link--circle'>
                    <i class="fa-solid fa-pen"></i>
                  </a>
                </div>
                <div style='font-size:.7rem;'>
                  <a
                    title='Delete'
                    @click=${() => this._onDeleteClick(item)}
                    class='icon-link icon-link--circle u-space-mx--small category-brand--double-decker'>
                    <i class="fa-solid fa-xmark"></i>
                  </a>
                </div>
                <div>${item.name}</div>
              </div>
            `)}
        </div>
        ` : html`
          <p>There is no foo to display</p>
        `}
      </div>
      <div class="l-sidebar-first">
        <section class="brand-textbox category-brand__background category-brand--pinot">
          Since we are disabling the shadowdom via the createRenderRoot method, we can use the brand styles loaded by the site css sheet,
          without having to load them into the shadowdom.
        </section>
      </div>
    </div>
  </div>

`;}
