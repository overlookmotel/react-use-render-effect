/* --------------------
 * react-use-render-effect module
 * ESLint config
 * ------------------*/

'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config'
	],
	overrides: [
		{
			// JS files in root are NodeJS modules (entry point and config files)
			files: ['./*.js'],
			extends: [
				'@overlookmotel/eslint-config-node'
			]
		}
	]
};
