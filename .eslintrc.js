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
		}
	]
};
