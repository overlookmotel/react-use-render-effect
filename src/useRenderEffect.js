// Modules
import {useState, useMemo} from 'react';
import invariant from 'tiny-invariant';

// Imports
import {getCurrentFiber, fiberIsPatched, REGISTER_DISPOSER_SIGNAL} from './shared.js';
import __DEV__ from './dev.js';

// Exports

/**
 * Render effect hook.
 * Works the same as `useEffect()`, but function is called synchronously
 * on first render, and disposer function is called
 * when element is destroyed (i.e. removed from the tree).
 *
 * Like `useEffect()`, when dependencies change, the disposer is called,
 * and the function is executed again.
 *
 * For the disposer function to be called when element is destroyed,
 * the component calling `useRenderEffect()`, or one of its ancestors,
 * must be wrapped with `withTracking()`.
 *
 * Without `withTracking()`, disposer will still be called when dependencies change.
 *
 * @param {Function} fn - Effect function. Should return `undefined` or a disposer function.
 * @param {Array|undefined} deps - Array of dependencies (see React `useEffect()` docs)
 * @returns {undefined}
 */
export default function useRenderEffect(fn, deps) {
	// Validate deps
	if (__DEV__ && deps !== undefined && deps !== null && !Array.isArray(deps)) {
		// Error message copied from what React's `useEffect()` error message
		console.error(
			'useRenderEffect received a final argument that is not an array '
			+ `(instead, received \`${typeof deps}\`). `
			+ 'When specified, the final argument must be an array.'
		);

		// Set deps to empty array to avoid further warning from `useMemo()`
		deps = [];
	}

	// Init disposer and register globally
	const [state] = useState(() => {
		let disposer = undefined;

		function setDisposer(newDisposer) {
			disposer = newDisposer;
		}

		function dispose() {
			if (disposer) {
				disposer();
				disposer = undefined;
			}
		}

		// Register dispose function
		// `dispose` will be called if this element or one above it in the tree is destroyed
		registerDisposer(dispose);

		return [setDisposer, dispose];
	});

	// When props change, run previous disposer, execute effect function, and record new disposer
	useMemo(() => {
		const [setDisposer, dispose] = state;

		// Run previous disposer
		dispose();

		// Execute effect function
		let disposer = fn();

		// Validate disposer
		invariant(
			disposer === undefined || typeof disposer === 'function',
			`useRenderEffect function must return a cleanup function or undefined. Received ${disposer}.`
		);

		// Record new disposer
		setDisposer(disposer);
	}, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Register disposer on current fiber by sending signal to its `return` setter.
 * @param {Function} disposer - Disposer function
 * @returns {undefined}
 */
function registerDisposer(disposer) {
	const fiber = getCurrentFiber();

	// Fiber will not be patched if `useRenderEffect()` is used without `withTracking()`.
	// Only register disposer if fiber is patched.
	// NB No need to check if there is a current fiber.
	// This function is called within `useState()` hook, so would have errored already
	// if not in a render cycle.
	if (fiberIsPatched(fiber)) {
		REGISTER_DISPOSER_SIGNAL.disposer = disposer;
		fiber.return = REGISTER_DISPOSER_SIGNAL;
	}
}
