import foo from "../lib/db-models/foo.js";
import protect from "../lib/protect.js";
import apiUtils from "../lib/utils/apiUtils.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  api.get('/foo', protect('hasBasicAccess'), async (req, res) => {

    let response = await foo.getAll();
    if ( apiUtils.returnIfDbError(req, res, response, 'Error retrieving a list of foo') ) return;
    res.json(response);
  });

}
