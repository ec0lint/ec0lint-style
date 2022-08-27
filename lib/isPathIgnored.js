'use strict';

const filterFilePaths = require('./utils/filterFilePaths');
const getFileIgnorer = require('./utils/getFileIgnorer');
const micromatch = require('micromatch');
const normalizePath = require('normalize-path');
const path = require('path');

/**
 * To find out if a path is ignored, we need to load the config,
 * which may have an ignoreFiles property. We then check the path
 * against these.
 * @param {import('ec0lint-style').InternalApi} ec0lintStyle
 * @param {string} [filePath]
 * @return {Promise<boolean>}
 */
module.exports = async function isPathIgnored(ec0lintStyle, filePath) {
	if (!filePath) {
		return false;
	}

	const cwd = ec0lintStyle._options.cwd;
	const ignorer = getFileIgnorer(ec0lintStyle._options);

	const result = await ec0lintStyle.getConfigForFile(filePath, filePath);

	if (!result) {
		return true;
	}

	// Glob patterns for micromatch should be in POSIX-style
	const ignoreFiles = /** @type {Array<string>} */ (result.config.ignoreFiles || []).map((s) =>
		normalizePath(s),
	);

	const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);

	if (micromatch([absoluteFilePath], ignoreFiles).length) {
		return true;
	}

	// Check filePath with .ec0lintStyleignore file
	if (filterFilePaths(ignorer, [path.relative(cwd, absoluteFilePath)]).length === 0) {
		return true;
	}

	return false;
};
