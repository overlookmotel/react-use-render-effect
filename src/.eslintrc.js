'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config-react'
	],
	overrides: [{
		files: './.eslintrc.js',
		extends: [
			'@overlookmotel/eslint-config-node'
		]
	}]
};
