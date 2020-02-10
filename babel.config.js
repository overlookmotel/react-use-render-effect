'use strict';

// TODO Make babel reference corejs polyfills rather then inlining

module.exports = {
	presets: [
		'@babel/preset-env'
	],
	plugins: [
		// All `for (... of ...) ...` loops are over arrays
		['@babel/plugin-transform-for-of', {assumeArray: true}],
		'dev-expression',
		['babel-plugin-transform-replace-expressions', {
			replace: {
				__DEBUG__: 'process.env.DEBUG && process.env.DEBUG.match(/[^,]\\s*(use-render-effect|\\*)\\s*[$,]/)'
			}
		}]
	]
};
