/* This file exists, because you cannot require the file specified in `main`
 * in package.json from a browserifued file (index.js)
 * Instead, you'll always get the file soecief in `browser`.
 */

module.exports = require('./common.js')
