/* --------------------
 * react-use-render-effect module
 * ESLint config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	extends: [
		'@overlookmotel/eslint-config-react'
	],
	globals: {
		__DEV__: true,
		__DEBUG__: true
	},
	overrides: [{
		files: './.eslintrc.js',
		extends: [
			'@overlookmotel/eslint-config-node'
		]
	}]
};
