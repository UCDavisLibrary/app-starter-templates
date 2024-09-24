import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class FooStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      list: new LruStore({name: 'foo.list', max: 1})
    };

    this.events = {};
  }

}

const store = new FooStore();
export default store;
