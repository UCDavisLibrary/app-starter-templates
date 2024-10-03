import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class SettingsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      getByCategory: new LruStore({name: 'settings.get-by-category'}),
    };
    this.events = {};
  }

}

const store = new SettingsStore();
export default store;
