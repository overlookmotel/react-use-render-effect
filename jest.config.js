/* --------------------
 * react-use-render-effect module
 * Jest config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	testEnvironment: 'node',
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.js'],
	setupFilesAfterEnv: ['jest-extended'],
	// Resolve `import from 'react-use-render-effect'` to src or build, depending on env variable
	moduleNameMapper: {
		'^react-use-render-effect$': resolvePath()
	}
};

function resolvePath() {
	const testEnv = process.env.TEST_ENV;
	if (testEnv === 'cjs') return '<rootDir>/index.js';
	if (testEnv === 'umd') return '<rootDir>/dist/umd/react-use-render-effect.js';
	return '<rootDir>/src/index.js';
}
