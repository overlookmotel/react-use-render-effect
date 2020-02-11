/* --------------------
 * react-use-render-effect module
 * ------------------*/

/* eslint-disable global-require */

'use strict';

// Exports

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/cjs/use-render-effect.min.js');
} else {
	module.exports = require('./dist/cjs/use-render-effect.js');
}
