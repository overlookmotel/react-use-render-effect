'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config'
	],
	overrides: [{
		files: ['./*'],
		extends: [
			'@overlookmotel/eslint-config-node'
		]
	}]
};
