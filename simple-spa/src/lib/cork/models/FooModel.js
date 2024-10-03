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

  async delete(fooId) {
    const r = await this.service.delete(fooId);
    if ( r.state === 'loaded' ) {
      this.store.data.list.purge();
    }
    return r;
  }

}

const model = new FooModel();
export default model;
