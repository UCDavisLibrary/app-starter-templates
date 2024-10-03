import settingsModel from "../lib/db-models/settings.js";
import protect from "../lib/protect.js";
import apiUtils from "../lib/utils/apiUtils.js";

/**
 * @param {Router} api - Express router instance
 */
export default (api) => {

  api.get('/settings/:category', protect('hasBasicAccess'), async (req, res) => {
    const category = req.params.category;
    let response = await settingsModel.getByCategory(category);
    if ( apiUtils.returnIfDbError(req, res, response, {errorMessage: 'Error retrieving settings'}) ) return;
    res.json(response);
  });
}
