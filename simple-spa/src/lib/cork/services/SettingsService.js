import BaseService from "./BaseService.js";
import SettingsStore from '../stores/SettingsStore.js';
import { appConfig } from '../../appGlobals.js';
import payload from '../../utils/corkPayload.js';

class SettingsService extends BaseService {

  constructor() {
    super();
    this.store = SettingsStore;
    this.basePath = `${appConfig.apiRoot}/settings`;
  }

  async getByCategory(category){
    let ido = {settingsCategory: category};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.getByCategory,
      () => this.request({
        url : `${this.basePath}/${category}`,
        checkCached : () => this.store.data.getByCategory.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          this.store.data.getByCategory
        )
      })
    );

    return this.store.data.getByCategory.get(id);
  }

}

const service = new SettingsService();
export default service;
