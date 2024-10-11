import nodeLogger from "./nodeLogger.js";
import typeTransform from "./typeTransform.js";

class ApiUtils {

  /**
   * @description Senda 400 or 500 response if there is an error in a database query
   * @param {*} req - Express request object
   * @param {*} res - Express response object
   * @param {*} modelResponse - Response from a db model query
   * @param {Object} kwargs - Optional keyword arguments
   * @param {String} kwargs.errorMessage - Custom error message to display to the user
   * @param {String} kwargs.errorHeading - Custom error heading to display to the user
   * @param {String} kwargs.errorMessage400 - Custom error message to display to the user for 400 errors
   * @param {String} kwargs.errorHeading400 - Custom error heading to display to the user for 400 errors
   * @param {String} kwargs.errorMessage500 - Custom error message to display to the user for 500 errors
   * @param {String} kwargs.errorHeading500 - Custom error heading to display to the user for 500 errors
   * @returns {Boolean} - True if there was an error, false if not
   * @example
   * const dbResponse = await db.query();
   * if ( this.returnIfModelError(req, res, dbResponse, {errorMessage: 'Error retrieving foo'}) ) return;
   */
  returnIfModelError(req, res, modelResponse, kwargs={}){
    if ( !modelResponse.error ) return false;

    if ( typeof kwargs === 'string' ){
      kwargs = {errorHeading: kwargs};
    }
    const errorMessage500 = kwargs.errorMessage500 || kwargs.errorMessage || 'A unexpected error has occurred. Please try again later.';
    const errorHeading500 = kwargs.errorHeading500 || kwargs.errorHeading;
    const errorMessage400 = kwargs.errorMessage400 || kwargs.errorMessage || 'Validation failed. Please review the form and submit again.';
    const errorHeading400 = kwargs.errorHeading400 || kwargs.errorHeading || 'Submission Error';

    // validation error
    if ( modelResponse.is400 ){
      const out = {
        ...modelResponse
      }
      if ( errorHeading400 ) out.errorHeading = errorHeading400;
      if ( errorMessage400 ) out.errorMessage = errorMessage400;
      res.status(400).json(out);
      return true;
    }

    // 500 error
    return this.return500IfDbError(req, res, modelResponse, errorMessage500, errorHeading500);
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
  return403(res, errorMessage, errorHeading){
    if ( !errorMessage ) errorMessage = 'Not authorized to access this resource.';
    return res.status(403).json({errorMessage, errorHeading});
  }

  /**
   * @description Return a 400 response if an id is missing or not a positive integer
   * @param {*} res - Express response object
   * @param {String|Number} id - Id to check
   * @param {String} errorMessage - Custom Error message to display to the user (optional)
   * @param {String} errorHeading - Custom Error heading to display to the user (optional)
   * @returns
   */
  return400IfMissingId(res, id, errorMessage, errorHeading){
    errorMessage = errorMessage || 'Missing id';
    if ( !typeTransform.toPositiveInt(id) ){
      return res.status(400).json({errorMessage, errorHeading});
    }
  }

}

export default new ApiUtils();
