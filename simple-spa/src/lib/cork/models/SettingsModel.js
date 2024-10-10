import {BaseModel} from '@ucd-lib/cork-app-utils';
import SettingsService from '../services/SettingsService.js';
import SettingsStore from '../stores/SettingsStore.js';

class SettingsModel extends BaseModel {

  constructor() {
    super();

    this.store = SettingsStore;
    this.service = SettingsService;

    this.register('SettingsModel');
  }

  getByCategory(category) {
    return this.service.getByCategory(category);
  }

  async update(data) {
    const r = await this.service.update(data);
    if ( r.state === 'loaded' ) {
      this.store.data.getByCategory.purge();
    }
    return r;
  }

}

const model = new SettingsModel();
export default model;
