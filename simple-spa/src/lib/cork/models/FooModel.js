import {BaseModel} from '@ucd-lib/cork-app-utils';
import FooService from '../services/FooService.js';
import FooStore from '../stores/FooStore.js';

class FooModel extends BaseModel {

  constructor() {
    super();

    this.store = FooStore;
    this.service = FooService;

    this.register('FooModel');
  }

  list() {
    return this.service.list();
  }

}

const model = new FooModel();
export default model;
