import foo from "../lib/db-models/foo.js";
import protect from "../lib/protect.js";
import nodeLogger from "../lib/utils/nodeLogger.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  api.get('/foo', protect('hasBasicAccess'), async (req, res) => {

    let response = await foo.getAll();
    if ( response.error ) {
      nodeLogger.serverError(req, response.error);
      return res.status(500).json({
        error: true,
        message: 'Error retrieving foo'
      });
    }
    res.json(response);
  });

}
