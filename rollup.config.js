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

const globals = {react: 'React'};

// Read debug flag
// Use `BUILD_DEBUG` for debug builds e.g. `BUILD_DEBUG=1 npm run build`
const debug = !!process.env.BUILD_DEBUG;

// Get build formats
// Use `BUILD_ENV` to build only specific formats
// e.g. `BUILD_ENV=cjs npm run build` or `BUILD_ENV=cjs,esm npm run build`
const formats = getFormats(['cjs', 'esm', 'umd']);

// Create build configs
module.exports = formats.flatMap(env => [
	createConfig(env, 'production', debug),
	createConfig(env, 'development', debug)
]);

function createConfig(format, env, debug) { // eslint-disable-line no-shadow
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

function getFormats(allFormats) {
	const formatsStr = process.env.BUILD_ENV;

	// Default = all formats
	if (!formatsStr) return allFormats;

	// Parse list of formats
	// eslint-disable-next-line no-shadow
	const formats = formatsStr.split(',').map(format => format.toLowerCase());
	const invalidFormat = formats.find(format => format !== 'all' && !allFormats.includes(format));
	if (invalidFormat != null) {
		throw new Error(`Unrecognised BUILD_ENV format '${invalidFormat}' - supported formats are ${allFormats.map(format => `'${format}'`).join(', ')} or 'all'`);
	}

	if (formats.includes('all')) return allFormats;

	return formats;
}
