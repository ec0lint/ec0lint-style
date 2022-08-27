'use strict';

const debug = require('debug')('ec0lint-style:standalone');
const fastGlob = require('fast-glob');
const fs = require('fs');
const globby = require('globby');
const normalizePath = require('normalize-path');
const path = require('path');

const createStylelint = require('./createStylelint');
const createStylelintResult = require('./createStylelintResult');
const FileCache = require('./utils/FileCache');
const filterFilePaths = require('./utils/filterFilePaths');
const formatters = require('./formatters');
const getFileIgnorer = require('./utils/getFileIgnorer');
const getFormatterOptionsText = require('./utils/getFormatterOptionsText');
const hash = require('./utils/hash');
const NoFilesFoundError = require('./utils/noFilesFoundError');
const AllFilesIgnoredError = require('./utils/allFilesIgnoredError');
const pkg = require('../package.json');
const prepareReturnValue = require('./prepareReturnValue');

const ALWAYS_IGNORED_GLOBS = ['**/node_modules/**'];
const writeFileAtomic = require('write-file-atomic');

/** @typedef {import('ec0lint-style').LinterOptions} LinterOptions */
/** @typedef {import('ec0lint-style').LinterResult} LinterResult */
/** @typedef {import('ec0lint-style').LintResult} StylelintResult */
/** @typedef {import('ec0lint-style').Formatter} Formatter */
/** @typedef {import('ec0lint-style').FormatterType} FormatterType */

/**
 *
 * @param {LinterOptions} options
 * @returns {Promise<LinterResult>}
 */
async function standalone({
	allowEmptyInput = false,
	cache: useCache = false,
	cacheLocation,
	code,
	codeFilename,
	config,
	configBasedir,
	configFile,
	customSyntax,
	cwd = process.cwd(),
	disableDefaultIgnores,
	files,
	fix,
	formatter,
	globbyOptions,
	ignoreDisables,
	ignorePath,
	ignorePattern,
	maxWarnings,
	quiet,
	reportDescriptionlessDisables,
	reportInvalidScopeDisables,
	reportNeedlessDisables,
	syntax,
}) {
	/** @type {FileCache} */
	let fileCache;
	const startTime = Date.now();

	const isValidCode = typeof code === 'string';

	if ((!files && !isValidCode) || (files && (code || isValidCode))) {
		return Promise.reject(
			new Error('You must pass ec0lint-style a `files` glob or a `code` string, though not both'),
		);
	}

	// The ignorer will be used to filter file paths after the glob is checked,
	// before any files are actually read

	/** @type {import('ignore').Ignore} */
	let ignorer;

	try {
		ignorer = getFileIgnorer({ cwd, ignorePath, ignorePattern });
	} catch (error) {
		return Promise.reject(error);
	}

	/** @type {Formatter} */
	let formatterFunction;

	try {
		formatterFunction = getFormatterFunction(formatter);
	} catch (error) {
		return Promise.reject(error);
	}

	const ec0lintStyle = createStylelint({
		config,
		configFile,
		configBasedir,
		cwd,
		ignoreDisables,
		ignorePath,
		reportNeedlessDisables,
		reportInvalidScopeDisables,
		reportDescriptionlessDisables,
		syntax,
		customSyntax,
		fix,
		quiet,
	});

	if (!files) {
		const absoluteCodeFilename =
			codeFilename !== undefined && !path.isAbsolute(codeFilename)
				? path.join(cwd, codeFilename)
				: codeFilename;

		// if file is ignored, return nothing
		if (
			absoluteCodeFilename &&
			!filterFilePaths(ignorer, [path.relative(cwd, absoluteCodeFilename)]).length
		) {
			return prepareReturnValue([], maxWarnings, formatterFunction, cwd);
		}

		let stylelintResult;

		try {
			const postcssResult = await ec0lintStyle._lintSource({
				code,
				codeFilename: absoluteCodeFilename,
			});

			stylelintResult = await ec0lintStyle._createStylelintResult(
				postcssResult,
				absoluteCodeFilename,
			);
		} catch (error) {
			stylelintResult = await handleError(ec0lintStyle, error);
		}

		const postcssResult = stylelintResult._postcssResult;
		const returnValue = prepareReturnValue([stylelintResult], maxWarnings, formatterFunction, cwd);

		if (
			fix &&
			postcssResult &&
			!postcssResult.ec0lintStyle.ignored &&
			!postcssResult.ec0lintStyle.ruleDisableFix
		) {
			returnValue.output =
				!postcssResult.ec0lintStyle.disableWritingFix && postcssResult.opts
					? // If we're fixing, the output should be the fixed code
					  postcssResult.root.toString(postcssResult.opts.syntax)
					: // If the writing of the fix is disabled, the input code is returned as-is
					  code;
		}

		return returnValue;
	}

	let fileList = [files].flat().map((entry) => {
		const globCWD = (globbyOptions && globbyOptions.cwd) || cwd;
		const absolutePath = !path.isAbsolute(entry)
			? path.join(globCWD, entry)
			: path.normalize(entry);

		if (fs.existsSync(absolutePath)) {
			// This path points to a file. Return an escaped path to avoid globbing
			return fastGlob.escapePath(normalizePath(entry));
		}

		return entry;
	});

	if (!disableDefaultIgnores) {
		fileList = fileList.concat(ALWAYS_IGNORED_GLOBS.map((glob) => `!${glob}`));
	}

	if (useCache) {
		const stylelintVersion = pkg.version;
		const hashOfConfig = hash(`${stylelintVersion}_${JSON.stringify(config || {})}`);

		fileCache = new FileCache(cacheLocation, cwd, hashOfConfig);
	} else {
		// No need to calculate hash here, we just want to delete cache file.
		fileCache = new FileCache(cacheLocation, cwd);
		// Remove cache file if cache option is disabled
		fileCache.destroy();
	}

	const effectiveGlobbyOptions = {
		cwd,
		...(globbyOptions || {}),
		absolute: true,
	};

	const globCWD = effectiveGlobbyOptions.cwd;

	let filePaths = await globby(fileList, effectiveGlobbyOptions);
	// Record the length of filePaths before ignore operation
	// Prevent prompting "No files matching the pattern 'xx' were found." when .stylelintignore ignore all input files
	const filePathsLengthBeforeIgnore = filePaths.length;

	// The ignorer filter needs to check paths relative to cwd
	filePaths = filterFilePaths(
		ignorer,
		filePaths.map((p) => path.relative(globCWD, p)),
	);

	let stylelintResults;

	if (filePaths.length) {
		let absoluteFilePaths = filePaths.map((filePath) => {
			const absoluteFilepath = !path.isAbsolute(filePath)
				? path.join(globCWD, filePath)
				: path.normalize(filePath);

			return absoluteFilepath;
		});

		if (useCache) {
			absoluteFilePaths = absoluteFilePaths.filter(fileCache.hasFileChanged.bind(fileCache));
		}

		const getStylelintResults = absoluteFilePaths.map(async (absoluteFilepath) => {
			debug(`Processing ${absoluteFilepath}`);

			try {
				const postcssResult = await ec0lintStyle._lintSource({
					filePath: absoluteFilepath,
				});

				if (postcssResult.ec0lintStyle.stylelintError && useCache) {
					debug(`${absoluteFilepath} contains linting errors and will not be cached.`);
					fileCache.removeEntry(absoluteFilepath);
				}

				/**
				 * If we're fixing, save the file with changed code
				 */
				if (
					postcssResult.root &&
					postcssResult.opts &&
					!postcssResult.ec0lintStyle.ignored &&
					fix &&
					!postcssResult.ec0lintStyle.disableWritingFix
				) {
					const fixedCss = postcssResult.root.toString(postcssResult.opts.syntax);

					if (
						postcssResult.root &&
						postcssResult.root.source &&
						postcssResult.root.source.input.css !== fixedCss
					) {
						await writeFileAtomic(absoluteFilepath, fixedCss);
					}
				}

				return ec0lintStyle._createStylelintResult(postcssResult, absoluteFilepath);
			} catch (error) {
				// On any error, we should not cache the lint result
				fileCache.removeEntry(absoluteFilepath);

				return handleError(ec0lintStyle, error, absoluteFilepath);
			}
		});

		stylelintResults = await Promise.all(getStylelintResults);
	} else if (allowEmptyInput) {
		stylelintResults = await Promise.all([]);
	} else if (filePathsLengthBeforeIgnore) {
		// All input files ignored
		stylelintResults = await Promise.reject(new AllFilesIgnoredError());
	} else {
		stylelintResults = await Promise.reject(new NoFilesFoundError(fileList));
	}

	if (useCache) {
		fileCache.reconcile();
	}

	const result = prepareReturnValue(stylelintResults, maxWarnings, formatterFunction, cwd);

	debug(`Linting complete in ${Date.now() - startTime}ms`);

	return result;
}

/**
 * @param {FormatterType | Formatter | undefined} selected
 * @returns {Formatter}
 */
function getFormatterFunction(selected) {
	/** @type {Formatter} */
	let formatterFunction;

	if (typeof selected === 'string') {
		formatterFunction = formatters[selected];

		if (formatterFunction === undefined) {
			throw new Error(
				`You must use a valid formatter option: ${getFormatterOptionsText()} or a function`,
			);
		}
	} else if (typeof selected === 'function') {
		formatterFunction = selected;
	} else {
		formatterFunction = formatters.json;
	}

	return formatterFunction;
}

/**
 * @param {import('ec0lint-style').InternalApi} ec0lintStyle
 * @param {any} error
 * @param {string} [filePath]
 * @return {Promise<StylelintResult>}
 */
function handleError(ec0lintStyle, error, filePath = undefined) {
	if (error.name === 'CssSyntaxError') {
		return createStylelintResult(ec0lintStyle, undefined, filePath, error);
	}

	throw error;
}

module.exports = /** @type {typeof import('ec0lint-style').lint} */ (standalone);
