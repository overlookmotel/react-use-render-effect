// Modules
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';

// Constants
const globals = {react: 'React'},
	babelOptions = {exclude: /node_modules/, sourceMaps: true};

// Exports

export default [
	makeConfig('production'),
	makeConfig('development')
];

function makeConfig(env) {
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
				'process.env.NODE_ENV': JSON.stringify(env)
			}),
			isDev ? undefined : terser()
		]
	};
}
