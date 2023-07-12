/**
 * This file is used to access the application configuration, which is saved in the window object.
 * APP_CONFIG is set in ../static.js in getConfig function
 */
let config = {};
if ( typeof window !== 'undefined' && window.APP_CONFIG ){
  config = window.APP_CONFIG;
}

export default config;
