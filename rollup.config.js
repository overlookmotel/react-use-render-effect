/* --------------------
 * react-use-render-effect module
 * Rollup config
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join,
	nodeResolve = require('@rollup/plugin-node-resolve'),
	commonjs = require('@rollup/plugin-commonjs'),
	babel = require('rollup-plugin-babel'),
	{terser} = require('rollup-plugin-terser'),
	replace = require('@rollup/plugin-replace');

// Exports

// To create debug builds, run `DEBUG=react-use-render-effect rollup`
const debug = !!process.env.DEBUG
	&& /(^|,)\s*(react-use-render-effect|\*)\s*($|,)/.test(process.env.DEBUG);

const globals = {react: 'React'};

// Build configs
module.exports = [
	makeConfig('cjs', 'production', debug),
	makeConfig('cjs', 'development', debug),
	makeConfig('umd', 'production', debug),
	makeConfig('umd', 'development', debug),
	makeConfig('esm', 'production', debug),
	makeConfig('esm', 'development', debug)
];

function makeConfig(format, env, debug) { // eslint-disable-line no-shadow
	const isProduction = env === 'production',
		isUmd = format === 'umd',
		isEsm = format === 'esm';

	return {
		input: 'src/index.js',
		output: {
			file: `dist/${format}/react-use-render-effect${isProduction ? '.min' : ''}.js`,
			name: 'ReactUseRenderEffect',
			format,
			// Include all external modules except React in UMD build,
			// include none in CJS + ESM builds
			globals: isUmd ? globals : undefined,
			sourcemap: true
		},
		external: isUmd ? Object.keys(globals) : isExternalModule,
		plugins: [
			babel({
				exclude: /node_modules/,
				sourceMaps: true,
				// require/import runtime helpers (ponyfills) in CJS + ESM builds
				runtimeHelpers: !isUmd,
				plugins: !isUmd
					? [['@babel/transform-runtime', {useESModules: isEsm}]]
					: undefined
			}),
			isUmd ? nodeResolve() : undefined,
			isUmd ? commonjs({include: /node_modules/}) : undefined,
			replace({
				// Set NODE_ENV to strip out __DEV__ code-fenced code in production builds
				'process.env.NODE_ENV': JSON.stringify(env),
				// Strip out all __DEBUG__ code-fenced code if not in debug mode
				'process.env.DEBUG': JSON.stringify(debug ? 'react-use-render-effect' : undefined)
			}),
			isProduction ? terser() : undefined
		]
	};
}

function isExternalModule(moduleId) {
	return !moduleId.startsWith('.') && !moduleId.startsWith(pathJoin(__dirname, 'src'));
}
