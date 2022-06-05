'use strict';

describe('terminallink', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it.skip('returns an ANSI escaped link', () => {
		process.env = { ...originalEnv, FORCE_HYPERLINK: '1' };
		const terminalLink = require('../terminalLink');

		expect(terminalLink('ec0lint-css', 'https://ec0lint.com/')).toBe('');
	});

	it('returns a passed text with an unsupported environment', () => {
		process.env = { ...originalEnv, FORCE_HYPERLINK: '0' };
		const terminalLink = require('../terminalLink');

		expect(terminalLink('ec0lint-css', 'https://ec0lint.com/')).toBe('ec0lint-css');
	});
});
