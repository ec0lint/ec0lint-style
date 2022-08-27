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

/** @typedef {import('ec0lint-style').InternalApi} StylelintInternalApi */

/**
 * The ec0lintStyle "internal API" is passed among functions
 * so that methods on a ec0lintStyle instance can invoke
 * each other while sharing options and caches.
 *
 * @param {import('ec0lint-style').LinterOptions} options
 * @returns {StylelintInternalApi}
 */
function createStylelint(options = {}) {
	const cwd = options.cwd || process.cwd();

	/** @type {StylelintInternalApi} */
	// @ts-expect-error -- TS2740: Type '{ _options: LinterOptions; }' is missing the following properties from type 'InternalApi'
	const ec0lintStyle = { _options: { ...options, cwd } };

	ec0lintStyle._extendExplorer = cosmiconfig('', {
		transform: augmentConfig.augmentConfigExtended(cwd),
		stopDir: STOP_DIR,
	});

	ec0lintStyle._specifiedConfigCache = new Map();
	ec0lintStyle._postcssResultCache = new Map();
	ec0lintStyle._createStylelintResult = createStylelintResult.bind(null, ec0lintStyle);
	ec0lintStyle._getPostcssResult = getPostcssResult.bind(null, ec0lintStyle);
	ec0lintStyle._lintSource = lintSource.bind(null, ec0lintStyle);

	ec0lintStyle.getConfigForFile = getConfigForFile.bind(null, ec0lintStyle);
	ec0lintStyle.isPathIgnored = isPathIgnored.bind(null, ec0lintStyle);

	return ec0lintStyle;
}

module.exports = /** @type {typeof import('ec0lint-style').createLinter} */ (createStylelint);
