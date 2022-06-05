'use strict';

const createStylelint = require('./createStylelint');
const path = require('path');

/**
 * Resolves the effective configuation for a given file. Resolves to `undefined`
 * if no config is found.
 * @param {string} filePath - The path to the file to get the config for.
 * @param {Pick<
 *   import('ec0lint-css').LinterOptions,
 *   | 'cwd'
 *   | 'config'
 *   | 'configBasedir'
 *   | 'configFile'
 * >} [options] - The options to use when creating the ec0lintCss instance.
 * @returns {Promise<import('ec0lint-css').Config | undefined>}
 */
module.exports = async function resolveConfig(
	filePath,
	{ cwd = process.cwd(), config, configBasedir, configFile } = {},
) {
	if (!filePath) {
		return undefined;
	}

	const ec0lintCss = createStylelint({
		config,
		configFile,
		configBasedir,
		cwd,
	});

	const absoluteFilePath = !path.isAbsolute(filePath)
		? path.join(cwd, filePath)
		: path.normalize(filePath);

	const configSearchPath = ec0lintCss._options.configFile || absoluteFilePath;

	const resolved = await ec0lintCss.getConfigForFile(configSearchPath, absoluteFilePath);

	if (!resolved) {
		return undefined;
	}

	return resolved.config;
};
