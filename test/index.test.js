/* --------------------
 * react-use-render-effect module
 * Tests
 * ------------------*/

// Modules
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import {useRenderEffect, withTracking} from 'react-use-render-effect';

// Init
import './support/index.js';

// Tests

describe('useRenderEffect', () => {
	it('is a function', () => {
		expect(useRenderEffect).toBeFunction();
	});
});

describe('withTracking', () => {
	it('is a function', () => {
		expect(withTracking).toBeFunction();
	});
});
