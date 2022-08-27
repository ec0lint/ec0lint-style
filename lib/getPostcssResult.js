'use strict';

const LazyResult = require('postcss/lib/lazy-result').default;
const path = require('path');
const { default: postcss } = require('postcss');
const { promises: fs } = require('fs');

/** @typedef {import('postcss').Result} Result */
/** @typedef {import('postcss').Syntax} Syntax */
/** @typedef {import('ec0lint-style').CustomSyntax} CustomSyntax */
/** @typedef {import('ec0lint-style').GetPostcssOptions} GetPostcssOptions */
/** @typedef {import('ec0lint-style').InternalApi} StylelintInternalApi */

const postcssProcessor = postcss();

/**
 * @param {StylelintInternalApi} ec0lintStyle
 * @param {GetPostcssOptions} options
 *
 * @returns {Promise<Result>}
 */
module.exports = async function getPostcssResult(ec0lintStyle, options = {}) {
	const cached = options.filePath
		? ec0lintStyle._postcssResultCache.get(options.filePath)
		: undefined;

	if (cached) {
		return cached;
	}

	if (ec0lintStyle._options.syntax) {
		let error = 'The "syntax" option is no longer available. ';

		error +=
			ec0lintStyle._options.syntax === 'css'
				? 'You can remove the "--syntax" CLI flag as ec0lint-style will now parse files as CSS by default'
				: `You should install an appropriate syntax, e.g. postcss-scss, and use the "customSyntax" option`;

		return Promise.reject(new Error(error));
	}

	const syntax = options.customSyntax
		? getCustomSyntax(options.customSyntax)
		: cssSyntax(ec0lintStyle, options.filePath);

	const postcssOptions = {
		from: options.filePath,
		syntax,
	};

	/** @type {string | undefined} */
	let getCode;

	if (options.code !== undefined) {
		getCode = options.code;
	} else if (options.filePath) {
		getCode = await fs.readFile(options.filePath, 'utf8');
	}

	if (getCode === undefined) {
		return Promise.reject(new Error('code or filePath required'));
	}

	if (options.codeProcessors && options.codeProcessors.length) {
		if (ec0lintStyle._options.fix) {
			console.warn(
				'Autofix is incompatible with processors and will be disabled. Are you sure you need a processor?',
			);
			ec0lintStyle._options.fix = false;
		}

		const sourceName = options.code ? options.codeFilename : options.filePath;

		for (const codeProcessor of options.codeProcessors) {
			getCode = codeProcessor(getCode, sourceName);
		}
	}

	const postcssResult = await new LazyResult(postcssProcessor, getCode, postcssOptions);

	if (options.filePath) {
		ec0lintStyle._postcssResultCache.set(options.filePath, postcssResult);
	}

	return postcssResult;
};

/**
 * @param {CustomSyntax} customSyntax
 * @returns {Syntax}
 */
function getCustomSyntax(customSyntax) {
	let resolved;

	if (typeof customSyntax === 'string') {
		try {
			resolved = require(customSyntax);
		} catch (error) {
			if (
				error &&
				typeof error === 'object' &&
				// @ts-expect-error -- TS2571: Object is of type 'unknown'.
				error.code === 'MODULE_NOT_FOUND' &&
				// @ts-expect-error -- TS2571: Object is of type 'unknown'.
				error.message.includes(customSyntax)
			) {
				throw new Error(
					`Cannot resolve custom syntax module "${customSyntax}". Check that module "${customSyntax}" is available and spelled correctly.\n\nCaused by: ${error}`,
				);
			}

			throw error;
		}

		/*
		 * PostCSS allows for syntaxes that only contain a parser, however,
		 * it then expects the syntax to be set as the `parse` option.
		 */
		if (!resolved.parse) {
			resolved = {
				parse: resolved,
				stringify: postcss.stringify,
			};
		}

		return resolved;
	}

	if (typeof customSyntax === 'object') {
		if (typeof customSyntax.parse === 'function') {
			resolved = { ...customSyntax };
		} else {
			throw new TypeError(
				`An object provided to the "customSyntax" option must have a "parse" property. Ensure the "parse" property exists and its value is a function.`,
			);
		}

		return resolved;
	}

	throw new Error(`Custom syntax must be a string or a Syntax object`);
}

/** @type {{ [key: string]: string }} */
const previouslyInferredExtensions = {
	html: 'postcss-html',
	js: '@ec0lint-style/postcss-css-in-js',
	jsx: '@ec0lint-style/postcss-css-in-js',
	less: 'postcss-less',
	md: 'postcss-markdown',
	sass: 'postcss-sass',
	sss: 'sugarss',
	scss: 'postcss-scss',
	svelte: 'postcss-html',
	ts: '@ec0lint-style/postcss-css-in-js',
	tsx: '@ec0lint-style/postcss-css-in-js',
	vue: 'postcss-html',
	xml: 'postcss-html',
	xst: 'postcss-html',
};

/**
 * @param {StylelintInternalApi} ec0lintStyle
 * @param {string|undefined} filePath
 * @returns {Syntax}
 */
function cssSyntax(ec0lintStyle, filePath) {
	const fileExtension = filePath ? path.extname(filePath).slice(1).toLowerCase() : '';
	const extensions = ['css', 'pcss', 'postcss'];

	if (previouslyInferredExtensions[fileExtension]) {
		console.warn(
			`${filePath}: When linting something other than CSS, you should install an appropriate syntax, e.g. "${previouslyInferredExtensions[fileExtension]}", and use the "customSyntax" option`,
		);
	}

	return {
		parse:
			ec0lintStyle._options.fix && extensions.includes(fileExtension)
				? require('postcss-safe-parser')
				: postcss.parse,
		stringify: postcss.stringify,
	};
}
