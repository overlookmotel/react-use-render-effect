// Modules
import React from 'react';

// Exports

const {ReactCurrentOwner} = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

/**
 * Get current fiber from React.
 * @returns {Object|undefined} - Current fiber, or `undefined` if not currently rendering.
 */
export function getCurrentFiber() {
	return ReactCurrentOwner.current;
}

/**
 * Check if a fiber is already patched.
 * @param {Object} fiber - React `FiberNode` instance
 * @returns {boolean} - `true` if already patched
 */
export function fiberIsPatched(fiber) {
	return !!Object.getOwnPropertyDescriptor(fiber, 'return').get;
}

// Dispose signal. Used to communicate between `useRenderEffect()`
// and fibers patched by `withTracking()`.
export const REGISTER_DISPOSER_SIGNAL = {dispose: null};
