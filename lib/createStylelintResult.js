'use strict';

const createPartialStylelintResult = require('./createPartialStylelintResult');

/** @typedef {import('ec0lint-css').PostcssResult} PostcssResult */
/** @typedef {import('ec0lint-css').LintResult} StylelintResult */

/**
 * @param {import('ec0lint-css').InternalApi} ec0lintCss
 * @param {PostcssResult} [postcssResult]
 * @param {string} [filePath]
 * @param {import('ec0lint-css').CssSyntaxError} [cssSyntaxError]
 * @return {Promise<StylelintResult>}
 */
module.exports = async function createStylelintResult(
	ec0lintCss,
	postcssResult,
	filePath,
	cssSyntaxError,
) {
	let stylelintResult = createPartialStylelintResult(postcssResult, cssSyntaxError);

	const configForFile = await ec0lintCss.getConfigForFile(filePath, filePath);

	const config = configForFile === null ? {} : configForFile.config;
	const file = stylelintResult.source || (cssSyntaxError && cssSyntaxError.file);

	if (config.resultProcessors) {
		for (const resultProcessor of config.resultProcessors) {
			// Result processors might just mutate the result object,
			// or might return a new one
			const returned = resultProcessor(stylelintResult, file);

			if (returned) {
				stylelintResult = returned;
			}
		}
	}

	return stylelintResult;
};
