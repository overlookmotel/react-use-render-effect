'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config'
	],
	overrides: [
		{
			files: ['./*.js'],
			extends: [
				'@overlookmotel/eslint-config-node'
			]
		},
		{
			files: ['./rollup.config.js'],
			parserOptions: {
				sourceType: 'module'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': ['off']
			}
		}
	]
};
