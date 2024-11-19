import { LitElement } from 'lit';
import {render} from "./no-results.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js";

export default class NoResults extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      results: {type: Array},
      mainText: {type: String, attribute: 'main-text'},
      subText: {type: String, attribute: 'sub-text'}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.results = [];
    this.mainText = 'No results found';
    this.subText = 'Please refine your search criteria and try again.';
  }

}

customElements.define('no-results', NoResults);
