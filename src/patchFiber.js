// Imports
import {fiberIsPatched, REGISTER_DISPOSER_SIGNAL} from './shared.js';
import {getDebugId, debug, sendDebugSignal, printDebugSignal, DEBUG_SIGNAL} from './debug.js';
import invariant from 'tiny-invariant';

// Imports
import __DEV__ from './dev.js';

// Constants
const DISPOSE_SIGNAL = {};

// Exports

/**
 * Patch fiber to:
 *   - Call any disposer callbacks when its element is unmounted
 *   - Patch any other fibers connected to it as child or sibling
 *
 * This is achieved by replacing fiber's `return`, `child` and `sibling`
 * properties with getter/setters. The setters store the values in
 * this function's closure.
 *
 * A fiber can have disposer callbacks registered on it which are fired
 * when the fiber is removed from the tree. The array of disposers
 * are stored in this function's closure.
 *
 * When a fiber is removed from the tree, `return` is set to `null`.
 * The `return` setter catches this event, fires its own disposers,
 * and passes the event to its child and sibling.
 * They will in turn pass the event to their own child + sibling,
 * so the event cascades throughout the whole tree of descendents.
 *
 * Fibers communicate with each other through signals which are passed
 * via the `return` setter (see comment below).
 *
 * @param {Object} fiber - React `FiberNode` instance
 * @param {boolean} isRoot - `true` if this is root of tracked tree
 * @param {string|null} parentDebugId - Debug ID of parent (`null` if is root)
 * @returns {undefined}
 */
export default function patchFiber(fiber, isRoot, parentDebugId) {
	// Get debug ID for this fiber and define function to send debug message to target fiber,
	// so it can print the message with it's own debug ID
	let debugId, debugOnTarget;
	if (__DEV__) {
		debugId = getDebugId(fiber, parentDebugId);
		debugOnTarget = (type, target) => sendDebugSignal(type, target, debugId, fiber)
	}

	if (__DEV__) debug('Patching fiber', debugId, fiber);

	// Local vars to contain fiber's `return`, `child` + `sibling` props
	let {return: parent, child, sibling} = fiber;

	/*
	 * Init disposers
	 */
	const disposers = [];
	function dispose() {
		if (__DEV__) debug('Disposing', debugId, fiber);

		// Run disposers
		for (const disposer of disposers) {
			disposer();
		}
		disposers.length = 0;

		// Dispose this fiber's tree
		if (child) disposeFiber(child);
	}

	/*
	 * Create getter/setter to capture if this fiber is disconnected from its parent.
	 * When this happens, the disposers are run.
	 *
	 * Setter is also used to receive signals to register a disposer on this fiber, or to dispose it.
	 * Cannot create separate methods on fiber object for this as React runs
	 * `Object.preventExtensions()` on fibers in dev mode, which prevents extra methods being added.
	 * So this is a hacky workaround.
	 */
	Object.defineProperty(fiber, 'return', {
		get() { return parent; },
		set(newParent) {
			if (__DEV__ && newParent === DEBUG_SIGNAL) {
				// Received debug signal - print debug message
				return printDebugSignal(debugId, fiber);
			}

			if (newParent === REGISTER_DISPOSER_SIGNAL) {
				// Received signal to register disposer.
				// Add to disposers array and exit - not a real attempt to set parent.
				if (__DEV__) debug('Received disposer', debugId, REGISTER_DISPOSER_SIGNAL.disposer);
				disposers.push(REGISTER_DISPOSER_SIGNAL.disposer);
				return;
			}

			if (newParent === DISPOSE_SIGNAL) {
				// Received signal to dispose.
				// Dispose and exit - not a real attempt to set parent.
				dispose();
				if (sibling) disposeFiber(sibling);
				return;
			}

			if (__DEV__ && newParent !== parent) {
				debugOnTarget('Detached child from', parent);
				debugOnTarget('Attached child to', newParent);
			}

			parent = newParent;

			if (parent === null) dispose();
		}
	});

	/*
	 * Create getters/setters to patch all new fibers
	 */
	Object.defineProperty(fiber, 'child', {
		get() { return child; },
		set(newChild) {
			child = newChild;
			patchFiberIfNotPatched(child, debugId);
			if (__DEV__) debugOnTarget('Set child', child);
		}
	});

	Object.defineProperty(fiber, 'sibling', {
		get() { return sibling; },
		set(newSibling) {
			sibling = newSibling;
			if (!isRoot) patchFiberIfNotPatched(sibling, parentDebugId);
			if (__DEV__) debugOnTarget('Set sibling', child);
		}
	});

	// Patch existing sub-tree
	patchFiberIfNotPatched(child, debugId);
	if (!isRoot) patchFiberIfNotPatched(sibling, parentDebugId);
}

/**
 * Patch fiber if it's not already patched.
 * @param {Object} fiber - React `FiberNode` instance
 * @param {string} parentDebugId - Debug ID of fiber's parent
 * @returns {undefined}
 */
function patchFiberIfNotPatched(fiber, parentDebugId) {
	if (fiber && !fiberIsPatched(fiber)) patchFiber(fiber, false, parentDebugId);
}

/**
 * Dispose a fiber via passing it a dispose signal.
 * @param {Object} fiber - React `FiberNode` instance
 * @returns {undefined}
 */
function disposeFiber(fiber) {
	if (!fiberIsPatched(fiber)) {
		if (__DEV__) {
			throw Object.assign(new Error('Cannot dispose an unpatched fiber'), {fiber});
		} else {
			invariant(false);
		}
	}

	// Tell fiber to dispose by sending dispose signal to its `return` setter
	fiber.return = DISPOSE_SIGNAL;
}
