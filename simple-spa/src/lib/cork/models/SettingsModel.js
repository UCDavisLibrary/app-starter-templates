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

}

const model = new SettingsModel();
export default model;
