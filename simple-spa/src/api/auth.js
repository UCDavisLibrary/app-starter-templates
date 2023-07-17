import fetch from 'node-fetch';
import jwt_decode from "jwt-decode";
import AccessToken from '../lib/utils/AccessToken.js';
import config from "../lib/serverConfig.js";
import cache from "../lib/db-models/cache.js";

export default (api) => {

  api.use(async (req, res, next) => {

    let token, userInfo;
    const clientId = config.auth.keycloakJsClient.clientId;

    // check for access token
    if ( !req.headers.authorization ) {
      res.status(401).json({
        error: true,
        message: 'You must authenticate to access this resource.'
      });
      return;
    }

    // parse token
    try {
      token = req.headers.authorization.replace('Bearer ', '');
      token = jwt_decode(token)
      if ( !token.iss ) throw new Error('Missing iss');
    } catch (error) {
      console.log(`Unable to parse access token: ${error.message}`);
      res.status(401).json({
        error: true,
        message: 'Unable to parse access token.'
      });
      return;
    }

    // check for cached token
    let cached = await cache.get('accessToken', token.preferred_username, config.auth.serverCacheExpiration);
    if ( cached.error ) {
      console.error('Unable to retrieve access token cache: ', cached.error);
    }
    if ( cached.res && cached.res.rowCount ) {
      cached = cached.res.rows[0];
      req.auth = {
        token: new AccessToken(cached.data.token, clientId),
        userInfo: cached.data.userInfo
      }
      next();
      return;
    }

    // fetch userinfo with access token
    try {
      const userInfoResponse = await fetch(`${token.iss}/protocol/openid-connect/userinfo`, {headers: {'Authorization': req.headers.authorization}});
      if ( !userInfoResponse.ok ) throw new Error(`HTTP Error Response: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
      userInfo = await userInfoResponse.json();
    } catch (error) {
      console.log(error);
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    // check if user has base privileges
    const accessToken = new AccessToken(token, clientId);
    if ( !accessToken.hasAccess ) {
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }
    const setCache = await cache.set('accessToken', token.preferred_username, {token: token, userInfo});
    if ( setCache.error ) {
      console.error('Unable to set access token cache: ', setCache.error);
    }
    req.auth = {
      token: accessToken,
      userInfo
    }

    next();
  });
}
