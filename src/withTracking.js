// Modules
import invariant from 'tiny-invariant';

// Imports
import patchFiber from './patchFiber.js';
import {getCurrentFiber, fiberIsPatched} from './shared.js';

// Exports

/**
 * Wrap React component so it tracks when its elements, or any descendents, are destroyed.
 * `useRenderEffect()` hooks into this to fire the hook's clean-up function when an element
 * is destroyed.
 *
 * It works by patching the element's fiber to fire clean-up when the fiber is removed from the tree.
 * The patched fiber will also patch any children or siblings connected to it, so the entire tree
 * under this element gets patched.
 *
 * @param {Function} Component - React function/class component
 * @returns {Function} - Wrapped component
 */
export default function withTracking(Component) {
	invariant(
		typeof Component === 'function',
		`withTracking must be passed a function or class component. Received: ${Component}.`
	);

	const PatchedComponent = isClassComponent(Component)
		? wrapClassComponent(Component)
		: wrapFunctionComponent(Component);

	PatchedComponent.displayName = `withTracking(${Component.displayName || Component.name || ''})`;

	return PatchedComponent;
}

function wrapFunctionComponent(Component) {
	return function Tracked(...args) {
		// Patch fiber for this element
		patchRootFiber();

		// Call original component
		return Component.call(this, ...args);
	};
}

function wrapClassComponent(Component) {
	return class Tracked extends Component {
		render(...args) {
			// Patch fiber for this element
			patchRootFiber();

			// Call original render method
			return super.render(...args);
		}
	};
}

/**
 * Get fiber for current element and patch it, if not already patched.
 * Must be called during rendering.
 * @returns {undefined}
 */
function patchRootFiber() {
	// Get fiber for element currently rendering
	const fiber = getCurrentFiber();

	// Patch fiber
	// NB Ignore if no current fiber - this can happen when using React Dev Tools
	if (fiber && !fiberIsPatched(fiber)) patchFiber(fiber, true, null);
}

/**
 * Test if component is a React class component.
 * @param {Function} Component - Function or class component
 * @returns {boolean} - `true` if is a React class component
 */
function isClassComponent(Component) {
	return !!(Component.prototype && Component.prototype.isReactComponent);
}
