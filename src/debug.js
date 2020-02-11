/* --------------------
 * react-use-render-effect module
 * Debug functions
 * This is tree-shaken out in builds unless debug mode enabled
 * ------------------*/

// Imports
import {fiberIsPatched} from './shared.js';

// Exports

export const DEBUG_SIGNAL = {debugId: ''};

let counter = 0;

/**
 * Create debug ID for a fiber.
 * Debug IDs extend the parent fiber's debug ID so they're of the form 'App(1).div(2)'.
 * @param {Object} fiber - React `FiberNode` instance
 * @param {string|null} parentId - Parent fiber's debug ID (`null`)
 * @returns {string} - Debug ID
 */
export function createDebugId(fiber, parentDebugId) {
	return `${parentDebugId ? `${parentDebugId}.` : ''}${getFiberDescription(fiber)}(${++counter})`;
}

function getFiberDescription(fiber) {
	const {tag} = fiber;
	if (tag === 0 || tag === 1 || tag === 2) return fiber.type.name;
	if (tag === 3) return '[HostRoot]';
	if (tag === 5) return fiber.elementType;
	if (tag === 6) return '[Text]';
	if (tag === 7) return '[Fragment]';
	if (tag === 13) return '[Suspense]';
	return `[Tag ${tag}]`;
}

/**
 * Log message to console including debugId of caller.
 * @param {string} debugId - Debug ID of fiber logging this debug message
 * @param {string} msg - Debug message
 * @param {...any} args - Additional arguments to pass to `console.log`
 * @returns {undefined}
 */
export function debugFiber(debugId, msg, ...args) {
	console.log(`${msg} ${debugId}`, ...args); // eslint-disable-line no-console
}

/**
 * Log message to console.
 * @param {string} debugId - Debug ID of fiber logging this debug message
 * @param {string} propName - Name of property being set
 * @param {Object} oldFiber - Previous value of property
 * @param {Object} newFiber - New value of property
 * @returns {undefined}
 */
export function debugFiberSet(debugId, propName, oldFiber, newFiber) {
	debugFiber(
		debugId,
		`Set ${propName} on`,
		`: was ${getDebugId(oldFiber)}, now ${getDebugId(newFiber)}`,
		{oldFiber, newFiber}
	);
}

/**
 * Get debug ID of a fiber.
 * Works by sending debug signal to the fiber.
 * The fiber will add its debug ID to the signal so it can be read back.
 * Signal is sent via fiber's `return` setter.
 * @param {Object} fiber - Fiber
 * @returns {string} - Debug ID
 */
function getDebugId(fiber) {
	if (!fiber) return `[${fiber}]`;
	if (!fiberIsPatched(fiber)) return '[unpatched]';

	fiber.return = DEBUG_SIGNAL;
	return DEBUG_SIGNAL.debugId;
}
