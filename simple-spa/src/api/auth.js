import fetch from 'node-fetch';
import jwt_decode from "jwt-decode";
import AccessToken from '../lib/utils/accessToken.js';
import config from "../lib/serverConfig.js";

export default (api) => {

  api.use(async (req, res, next) => {

    let token, oidcConfig, userInfo;

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

    next();
  });
}
