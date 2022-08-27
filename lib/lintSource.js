'use strict';

const isPathNotFoundError = require('./utils/isPathNotFoundError');
const lintPostcssResult = require('./lintPostcssResult');
const path = require('path');

/** @typedef {import('ec0lint-style').InternalApi} StylelintInternalApi */
/** @typedef {import('ec0lint-style').GetLintSourceOptions} Options */
/** @typedef {import('postcss').Result} Result */
/** @typedef {import('ec0lint-style').PostcssResult} PostcssResult */
/** @typedef {import('ec0lint-style').StylelintPostcssResult} StylelintPostcssResult */

/**
 * Run stylelint on a PostCSS Result, either one that is provided
 * or one that we create
 * @param {StylelintInternalApi} ec0lintStyle
 * @param {Options} options
 * @returns {Promise<PostcssResult>}
 */
module.exports = async function lintSource(ec0lintStyle, options = {}) {
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

	const isIgnored = await ec0lintStyle.isPathIgnored(inputFilePath).catch((err) => {
		if (isCodeNotFile && isPathNotFoundError(err)) return false;

		throw err;
	});

	if (isIgnored) {
		return options.existingPostcssResult
			? Object.assign(options.existingPostcssResult, {
					ec0lintStyle: createEmptyStylelintPostcssResult(),
			  })
			: createEmptyPostcssResult(inputFilePath);
	}

	const configSearchPath = ec0lintStyle._options.configFile || inputFilePath;
	const cwd = ec0lintStyle._options.cwd;

	const configForFile = await ec0lintStyle
		.getConfigForFile(configSearchPath, inputFilePath)
		.catch((err) => {
			if (isCodeNotFile && isPathNotFoundError(err)) return ec0lintStyle.getConfigForFile(cwd);

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
		(await ec0lintStyle._getPostcssResult({
			code: options.code,
			codeFilename: options.codeFilename,
			filePath: inputFilePath,
			codeProcessors: config.codeProcessors,
			customSyntax: config.customSyntax,
		}));

	const stylelintPostcssResult = Object.assign(postcssResult, {
		ec0lintStyle: stylelintResult,
	});

	await lintPostcssResult(ec0lintStyle._options, stylelintPostcssResult, config);

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
		ec0lintStyle: createEmptyStylelintPostcssResult(),
		warn: () => {},
	};
}
