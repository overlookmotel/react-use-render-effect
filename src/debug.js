// Imports
import {fiberIsPatched} from './shared.js';

// Exports

export const DEBUG_SIGNAL = {type: null, debugId: null, fiber: null};

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
 * Log message to console.
 * @param {...any} args - Arguments
 * @returns {undefined}
 */
export function debug(msg, debugId, obj) {
	console.log(`# ${msg} ${debugId}`, obj); // eslint-disable-line no-console
}

/**
 * Send debug signal to target fiber.
 * The target will then add it's own debug ID to the message and log it.
 * Signal is sent via target's `return` setter.
 * @param {string} type - Event description
 * @param {Object} target - Target fiber
 * @param {string} debugId - Sender's debug ID
 * @param {Object} fiber - Sender fiber
 * @returns {undefined}
 */
export function sendDebugSignal(type, target, debugId, fiber) {
	if (!target) {
		printDebugMessage(type, `[${target}]`, target, debugId, fiber);
		return;
	}

	if (!fiberIsPatched(target)) {
		printDebugMessage(type, '[unpatched]', target, debugId, fiber);
		return;
	}

	DEBUG_SIGNAL.type = type;
	DEBUG_SIGNAL.debugId = debugId;
	DEBUG_SIGNAL.fiber = fiber;
	target.return = DEBUG_SIGNAL;
}

/**
 * Called by target fiber when it receives a debug signal.
 * Logs the message. It gets details of the sender direct from `DEBUG_SIGNAL`.
 * @param {string} debugId - Debug ID
 * @param {Object} fiber - Target fiber
 */
export function printDebugSignal(debugId, fiber) {
	printDebugMessage(DEBUG_SIGNAL.type, debugId, fiber, DEBUG_SIGNAL.debugId, DEBUG_SIGNAL.fiber);
}

function printDebugMessage(type, debugId, fiber, senderDebugId, senderFiber) {
	debug(`${type} ${debugId}:`, senderDebugId, {receiver: fiber, sender: senderFiber});
}
