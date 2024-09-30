import { AppStateStore } from "@ucd-lib/cork-app-state";

/**
 * @description Implementation of AppStateStore
 */
class AppStateStoreImpl extends AppStateStore {
  constructor() {
    super();

    this.userProfile = {};

    this.events.PAGE_STATE_UPDATE = 'page-state-update';
    this.events.PAGE_TITLE_UPDATE = 'page-title-update';
    this.events.BREADCRUMB_UPDATE = 'breadcrumb-update';
    this.events.APP_ROUTE_ID_UPDATE = 'app-route-id-update';
    this.events.ALERT_BANNER_UPDATE = 'alert-banner-update';
    this.events.APP_DIALOG_OPEN = 'app-dialog-open';
    this.events.APP_DIALOG_ACTION = 'app-dialog-action';
  }
}

const store = new AppStateStoreImpl();
export default store;
