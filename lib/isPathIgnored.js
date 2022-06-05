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
 * @param {import('ec0lint-css').InternalApi} ec0lintCss
 * @param {string} [filePath]
 * @return {Promise<boolean>}
 */
module.exports = async function isPathIgnored(ec0lintCss, filePath) {
	if (!filePath) {
		return false;
	}

	const cwd = ec0lintCss._options.cwd;
	const ignorer = getFileIgnorer(ec0lintCss._options);

	const result = await ec0lintCss.getConfigForFile(filePath, filePath);

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

	// Check filePath with .ec0lintcssignore file
	if (filterFilePaths(ignorer, [path.relative(cwd, absoluteFilePath)]).length === 0) {
		return true;
	}

	return false;
};
