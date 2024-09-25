import nodeLogger from "./nodeLogger.js";

class ApiUtils {

  /**
   * @description Senda 400 or 500 response if there is an error in a database query
   * @param {*} req - Express request object
   * @param {*} res - Express response object
   * @param {*} dbResponse - Response from a database query
   * @param {String} errorMessage - Error message to display to the user if 500 error
   * @param {String} errorHeading - Error heading to display to the user if 500 error
   * @returns {Boolean} - True if there was an error, false if not
   * @example
   * const dbResponse = await db.query();
   * if ( this.returnIfDbError(req, res, dbResponse, 'Error retrieving foo') ) return;
   */
  returnIfDbError(req, res, dbResponse, errorMessage, errorHeading){
    if ( !dbResponse.error ) return false;

    // validation error
    if ( dbResponse.is400 ){
      res.status(400).json(dbResponse);
      return true;
    }

    // 500 error
    return this.return500IfDbError(req, res, dbResponse, errorMessage, errorHeading);
  }

  /**
   * @description Send a 500 response if a database error
   * @param {*} req - Express request object
   * @param {*} res - Express response object
   * @param {*} dbResponse - Response from a database query
   * @param {String} errorMessage - Error message to display to the user
   * @param {String} errorHeading - Error heading to display to the user
   * @returns {Boolean} - True if there was an error, false if not
   * @example
   * const dbResponse = await db.query();
   * if ( this.return500IfDbError(req, res, dbResponse, 'Error retrieving foo', 'An Error Occurred') ) return;
   */
  return500IfDbError(req, res, dbResponse, errorMessage, errorHeading){
    if ( !dbResponse.error ) return false;
    const serverLogId = nodeLogger.serverError(req, dbResponse.error);
    res.status(500).json({
      errorMessage,
      errorHeading,
      serverLogId
    });
    return true;
  }

  /**
   * @description Return a 403 response
   * @param {*} res - Express response object
   * @param {String} errorMessage - Custom Error message to display to the user (optional)
   * @param {String} errorHeading - Custom Error heading to display to the user (optional)
   */
  do403(res, errorMessage, errorHeading){
    if ( !errorMessage ) errorMessage = 'Not authorized to access this resource.';
    return res.status(403).json({errorMessage, errorHeading});
  }

}

export default new ApiUtils();
