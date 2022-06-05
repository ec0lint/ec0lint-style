'use strict';

const augmentConfig = require('./augmentConfig');
const createStylelintResult = require('./createStylelintResult');
const getConfigForFile = require('./getConfigForFile');
const getPostcssResult = require('./getPostcssResult');
const isPathIgnored = require('./isPathIgnored');
const lintSource = require('./lintSource');
const { cosmiconfig } = require('cosmiconfig');

const IS_TEST = process.env.NODE_ENV === 'test';
const STOP_DIR = IS_TEST ? process.cwd() : undefined;

/** @typedef {import('ec0lint-css').InternalApi} StylelintInternalApi */

/**
 * The ec0lintCss "internal API" is passed among functions
 * so that methods on a ec0lintCss instance can invoke
 * each other while sharing options and caches.
 *
 * @param {import('ec0lint-css').LinterOptions} options
 * @returns {StylelintInternalApi}
 */
function createStylelint(options = {}) {
	const cwd = options.cwd || process.cwd();

	/** @type {StylelintInternalApi} */
	// @ts-expect-error -- TS2740: Type '{ _options: LinterOptions; }' is missing the following properties from type 'InternalApi'
	const ec0lintCss = { _options: { ...options, cwd } };

	ec0lintCss._extendExplorer = cosmiconfig('', {
		transform: augmentConfig.augmentConfigExtended(cwd),
		stopDir: STOP_DIR,
	});

	ec0lintCss._specifiedConfigCache = new Map();
	ec0lintCss._postcssResultCache = new Map();
	ec0lintCss._createStylelintResult = createStylelintResult.bind(null, ec0lintCss);
	ec0lintCss._getPostcssResult = getPostcssResult.bind(null, ec0lintCss);
	ec0lintCss._lintSource = lintSource.bind(null, ec0lintCss);

	ec0lintCss.getConfigForFile = getConfigForFile.bind(null, ec0lintCss);
	ec0lintCss.isPathIgnored = isPathIgnored.bind(null, ec0lintCss);

	return ec0lintCss;
}

module.exports = /** @type {typeof import('ec0lint-css').createLinter} */ (createStylelint);
