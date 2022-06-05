'use strict';

const isPathNotFoundError = require('./utils/isPathNotFoundError');
const lintPostcssResult = require('./lintPostcssResult');
const path = require('path');

/** @typedef {import('ec0lint-css').InternalApi} StylelintInternalApi */
/** @typedef {import('ec0lint-css').GetLintSourceOptions} Options */
/** @typedef {import('postcss').Result} Result */
/** @typedef {import('ec0lint-css').PostcssResult} PostcssResult */
/** @typedef {import('ec0lint-css').StylelintPostcssResult} StylelintPostcssResult */

/**
 * Run stylelint on a PostCSS Result, either one that is provided
 * or one that we create
 * @param {StylelintInternalApi} ec0lintCss
 * @param {Options} options
 * @returns {Promise<PostcssResult>}
 */
module.exports = async function lintSource(ec0lintCss, options = {}) {
	if (!options.filePath && options.code === undefined && !options.existingPostcssResult) {
		return Promise.reject(new Error('You must provide filePath, code, or existingPostcssResult'));
	}

	const isCodeNotFile = options.code !== undefined;

	const inputFilePath = isCodeNotFile ? options.codeFilename : options.filePath;

	if (inputFilePath !== undefined && !path.isAbsolute(inputFilePath)) {
		if (isCodeNotFile) {
			return Promise.reject(new Error('codeFilename must be an absolute path'));
		}

		return Promise.reject(new Error('filePath must be an absolute path'));
	}

	const isIgnored = await ec0lintCss.isPathIgnored(inputFilePath).catch((err) => {
		if (isCodeNotFile && isPathNotFoundError(err)) return false;

		throw err;
	});

	if (isIgnored) {
		return options.existingPostcssResult
			? Object.assign(options.existingPostcssResult, {
					ec0lintCss: createEmptyStylelintPostcssResult(),
			  })
			: createEmptyPostcssResult(inputFilePath);
	}

	const configSearchPath = ec0lintCss._options.configFile || inputFilePath;
	const cwd = ec0lintCss._options.cwd;

	const configForFile = await ec0lintCss
		.getConfigForFile(configSearchPath, inputFilePath)
		.catch((err) => {
			if (isCodeNotFile && isPathNotFoundError(err)) return ec0lintCss.getConfigForFile(cwd);

			throw err;
		});

	if (!configForFile) {
		return Promise.reject(new Error('Config file not found'));
	}

	const config = configForFile.config;
	const existingPostcssResult = options.existingPostcssResult;

	/** @type {StylelintPostcssResult} */
	const stylelintResult = {
		ruleSeverities: {},
		customMessages: {},
		ruleMetadata: {},
		disabledRanges: {},
	};

	const postcssResult =
		existingPostcssResult ||
		(await ec0lintCss._getPostcssResult({
			code: options.code,
			codeFilename: options.codeFilename,
			filePath: inputFilePath,
			codeProcessors: config.codeProcessors,
			customSyntax: config.customSyntax,
		}));

	const stylelintPostcssResult = Object.assign(postcssResult, {
		ec0lintCss: stylelintResult,
	});

	await lintPostcssResult(ec0lintCss._options, stylelintPostcssResult, config);

	return stylelintPostcssResult;
};

/**
 * @returns {StylelintPostcssResult}
 */
function createEmptyStylelintPostcssResult() {
	return {
		ruleSeverities: {},
		customMessages: {},
		ruleMetadata: {},
		disabledRanges: {},
		ignored: true,
		stylelintError: false,
	};
}

/**
 * @param {string} [filePath]
 * @returns {PostcssResult}
 */
function createEmptyPostcssResult(filePath) {
	return {
		root: {
			source: {
				input: { file: filePath },
			},
		},
		messages: [],
		opts: undefined,
		ec0lintCss: createEmptyStylelintPostcssResult(),
		warn: () => {},
	};
}
