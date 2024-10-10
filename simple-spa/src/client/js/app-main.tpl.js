import { html } from 'lit';

export function render() {
return html`
  <ucd-theme-header>
    <ucdlib-branding-bar slogan=${this.appTitle}>
      ${this.userIsAuthenticated ? html`
        <a href='/logout' ?hidden=${!this.userIsAuthenticated}>Logout</a>
      ` : html``}
    </ucdlib-branding-bar>

    <!-- TODO: Replace these with your own primary nav links -->
    <ucd-theme-primary-nav>
      <a href='/foo'>Foo</a>
    </ucd-theme-primary-nav>

    <ucd-theme-quick-links
      title="Admin"
      style-modifiers="highlight"
      ?hidden=${!this.AuthModel.getToken().hasAdminAccess}>
      <a href="/admin/settings">General Settings</a>
    </ucd-theme-quick-links>
  </ucd-theme-header>
  <app-banner-textbox></app-banner-textbox>

  <section ?hidden=${!this.pageIsLoaded || !this.showPageTitle}>
    <h1 class="page-title">${this.pageTitle}</h1>
  </section>

  <ol class="breadcrumbs" ?hidden=${!this.pageIsLoaded || !this.showBreadcrumbs}>
    ${this.breadcrumbs.map((b, i) => html`
      <li>
      ${i == this.breadcrumbs.length - 1 ? html`<span>${b.text}</span>` : html`<a href=${b.link}>${b.text}</a>`}
      </li>
    `)}
  </ol>

  <!-- TODO: Replace these with your own pages -->
  <ucdlib-pages id='main-pages' attr-for-selected='page-id' selected=${this.page}>
    <app-page-alt-state page-id=${this._notLoadedPageId}></app-page-alt-state>
    <app-page-home page-id='home'></app-page-home>
    <app-page-foo page-id='foo'></app-page-foo>
    <app-page-admin-home page-id='admin-home'></app-page-admin-home>
    <app-page-admin-settings page-id='admin-settings'></app-page-admin-settings>
  </ucdlib-pages>
  <app-dialog-modal></app-dialog-modal>
  <app-toast></app-toast>

`;}
