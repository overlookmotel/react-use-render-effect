'use strict';

// Modules
const nodeResolve = require('rollup-plugin-node-resolve'),
	commonjs = require('rollup-plugin-commonjs'),
	babel = require('rollup-plugin-babel'),
	{terser} = require('rollup-plugin-terser'),
	replace = require('rollup-plugin-replace');

// Constants
const globals = {react: 'React'},
	babelOptions = {exclude: /node_modules/, sourceMaps: true};

// Exports

module.exports = [
	makeConfig('production', false),
	makeConfig('development', false)
];

function makeConfig(env, debug) {
	const isDev = env === 'development';

	return {
		input: 'src/index.js',
		output: {
			file: `dist/use-render-effect${isDev ? '' : '.min'}.js`,
			name: 'use-render-effect',
			format: 'umd',
			globals,
			exports: 'named',
			sourcemap: true
		},
		external: Object.keys(globals),
		plugins: [
			babel(babelOptions),
			nodeResolve(),
			commonjs({include: /node_modules/}),
			replace({
				'process.env.NODE_ENV': JSON.stringify(env),
				'process.env.DEBUG': JSON.stringify(debug)
			}),
			isDev ? undefined : terser()
		]
	};
}
