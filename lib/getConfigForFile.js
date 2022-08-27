'use strict';

const configurationError = require('./utils/configurationError');
const path = require('path');
const { augmentConfigFull } = require('./augmentConfig');
const { cosmiconfig } = require('cosmiconfig');

const IS_TEST = process.env.NODE_ENV === 'test';
const STOP_DIR = IS_TEST ? process.cwd() : undefined;

/** @typedef {import('ec0lint-style').InternalApi} StylelintInternalApi */
/** @typedef {import('ec0lint-style').Config} StylelintConfig */
/** @typedef {import('ec0lint-style').CosmiconfigResult} StylelintCosmiconfigResult */

/**
 * @param {StylelintInternalApi} ec0lintStyle
 * @param {string} [searchPath]
 * @param {string} [filePath]
 * @returns {Promise<StylelintCosmiconfigResult>}
 */
module.exports = async function getConfigForFile(
	ec0lintStyle,
	searchPath = ec0lintStyle._options.cwd,
	filePath,
) {
	const optionsConfig = ec0lintStyle._options.config;
	const cwd = ec0lintStyle._options.cwd;

	if (optionsConfig !== undefined) {
		const cached = ec0lintStyle._specifiedConfigCache.get(optionsConfig);

		// If config has overrides the resulting config might be different for some files.
		// Cache results only if resulted config is the same for all linted files.
		if (cached && !optionsConfig.overrides) {
			return cached;
		}

		const augmentedResult = augmentConfigFull(ec0lintStyle, filePath, {
			config: optionsConfig,
			// Add the extra path part so that we can get the directory without being
			// confused
			filepath: path.join(cwd, 'argument-config'),
		});

		ec0lintStyle._specifiedConfigCache.set(optionsConfig, augmentedResult);

		return augmentedResult;
	}

	const configExplorer = cosmiconfig('ec0lint-style', {
		transform: (cosmiconfigResult) => augmentConfigFull(ec0lintStyle, filePath, cosmiconfigResult),
		stopDir: STOP_DIR,
	});

	let config = ec0lintStyle._options.configFile
		? await configExplorer.load(ec0lintStyle._options.configFile)
		: await configExplorer.search(searchPath);

	if (!config) {
		config = await configExplorer.search(cwd);
	}

	if (!config) {
		return Promise.reject(
			configurationError(`No configuration provided${searchPath ? ` for ${searchPath}` : ''}`),
		);
	}

	return config;
};
