import BaseService from "./BaseService.js";
import FooStore from '../stores/FooStore.js';
import { appConfig } from '../../appGlobals.js';
import payload from '../../utils/corkPayload.js';

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

}

const service = new FooService();
export default service;
