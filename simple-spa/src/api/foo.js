import foo from "../lib/db-models/foo.js";
import protect from "../lib/protect.js";
import apiUtils from "../lib/utils/apiUtils.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  api.get('/foo', protect('hasBasicAccess'), async (req, res) => {
    let response = await foo.getAll();
    if ( apiUtils.returnIfDbError(req, res, response, {errorMessage: 'Error retrieving a list of foo'}) ) return;
    res.json(response);
  });

  api.delete('/foo/:id', protect('hasBasicAccess'), async (req, res) => {
    let response = await foo.delete(req.params.id);
    const kwargs = {
      errorMessage500: 'A database error occurred deleting foo item',
      errorMessage400: 'Foo item not found',
    }
    if ( apiUtils.returnIfDbError(req, res, response, kwargs) ) return;
    res.json(response);
  });

}
