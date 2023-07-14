/**
 * @param {Roter} api - Express router instance
 */
export default (api) => {

  api.get('/foo', (req, res) => {
    res.json(['foo', 'bar']);
  });

}
