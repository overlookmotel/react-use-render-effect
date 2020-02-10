'use strict';

module.exports = {
	presets: [
		'@babel/preset-env'
	],
	plugins: [
		// All `for (... of ...) ...` loops are over arrays
		['@babel/plugin-transform-for-of', {assumeArray: true}],
		'dev-expression'
	]
};