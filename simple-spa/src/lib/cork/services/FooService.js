import BaseService from "./BaseService.js";
import FooStore from '../stores/FooStore.js';
import { appConfig } from '../../appGlobals.js';
import payload from '../payload.js';

class FooService extends BaseService {

  constructor() {
    super();
    this.store = FooStore;
    this.basePath = `${appConfig.apiRoot}/foo`;
  }

  async list(){
    let ido = {action: 'list'};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.list,
      () => this.request({
        url : this.basePath,
        checkCached : () => this.store.data.list.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.list
        )
      })
    );

    return this.store.data.list.get(id);
  }

  async delete(fooId) {
    let ido = {foo: fooId};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.delete,
      () => this.request({
        url : `${this.basePath}/${fooId}`,
        fetchOptions: { method: 'DELETE' },
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.delete
        )
      })
    );

    return this.store.data.delete.get(id);
  }

}

const service = new FooService();
export default service;
