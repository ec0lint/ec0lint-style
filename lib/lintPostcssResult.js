'use strict';

const assignDisabledRanges = require('./assignDisabledRanges');
const getOsEol = require('./utils/getOsEol');
const reportUnknownRuleNames = require('./reportUnknownRuleNames');
const rules = require('./rules');

/** @typedef {import('ec0lint-style').LinterOptions} LinterOptions */
/** @typedef {import('ec0lint-style').PostcssResult} PostcssResult */
/** @typedef {import('ec0lint-style').Config} StylelintConfig */

/**
 * @param {LinterOptions} stylelintOptions
 * @param {PostcssResult} postcssResult
 * @param {StylelintConfig} config
 * @returns {Promise<any>}
 */
function lintPostcssResult(stylelintOptions, postcssResult, config) {
	postcssResult.ec0lintStyle.ruleSeverities = {};
	postcssResult.ec0lintStyle.customMessages = {};
	postcssResult.ec0lintStyle.ruleMetadata = {};
	postcssResult.ec0lintStyle.stylelintError = false;
	postcssResult.ec0lintStyle.quiet = config.quiet;
	postcssResult.ec0lintStyle.config = config;

	/** @type {string | undefined} */
	let newline;
	const postcssDoc = postcssResult.root;

	if (postcssDoc) {
		if (!('type' in postcssDoc)) {
			throw new Error('Unexpected Postcss root object!');
		}

		const newlineMatch = postcssDoc.source && postcssDoc.source.input.css.match(/\r?\n/);

		newline = newlineMatch ? newlineMatch[0] : getOsEol();

		assignDisabledRanges(postcssDoc, postcssResult);
	}

	const isFileFixCompatible = isFixCompatible(postcssResult);

	if (!isFileFixCompatible) {
		postcssResult.ec0lintStyle.disableWritingFix = true;
	}

	const postcssRoots = /** @type {import('postcss').Root[]} */ (
		postcssDoc && postcssDoc.constructor.name === 'Document' ? postcssDoc.nodes : [postcssDoc]
	);

	// Promises for the rules. Although the rule code runs synchronously now,
	// the use of Promises makes it compatible with the possibility of async
	// rules down the line.
	/** @type {Array<Promise<any>>} */
	const performRules = [];

	const rulesOrder = Object.keys(rules);
	const ruleNames = config.rules
		? Object.keys(config.rules).sort((a, b) => rulesOrder.indexOf(a) - rulesOrder.indexOf(b))
		: [];

	for (const ruleName of ruleNames) {
		const ruleFunction =
			rules[ruleName] || (config.pluginFunctions && config.pluginFunctions[ruleName]);

		if (ruleFunction === undefined) {
			performRules.push(
				Promise.all(
					postcssRoots.map((postcssRoot) =>
						reportUnknownRuleNames(ruleName, postcssRoot, postcssResult),
					),
				),
			);

			continue;
		}

		const ruleSettings = config.rules && config.rules[ruleName];

		if (ruleSettings === null || ruleSettings[0] === null) {
			continue;
		}

		const primaryOption = ruleSettings[0];
		const secondaryOptions = ruleSettings[1];

		// Log the rule's severity in the PostCSS result
		const defaultSeverity = config.defaultSeverity || 'error';
		// disableFix in secondary option
		const disableFix = (secondaryOptions && secondaryOptions.disableFix === true) || false;

		if (disableFix) {
			postcssResult.ec0lintStyle.ruleDisableFix = true;
		}

		postcssResult.ec0lintStyle.ruleSeverities[ruleName] =
			(secondaryOptions && secondaryOptions.severity) || defaultSeverity;
		postcssResult.ec0lintStyle.customMessages[ruleName] =
			secondaryOptions && secondaryOptions.message;
		postcssResult.ec0lintStyle.ruleMetadata[ruleName] = ruleFunction.meta || {};

		performRules.push(
			Promise.all(
				postcssRoots.map((postcssRoot) =>
					ruleFunction(primaryOption, secondaryOptions, {
						fix:
							!disableFix &&
							stylelintOptions.fix &&
							// Next two conditionals are temporary measures until #2643 is resolved
							isFileFixCompatible &&
							!postcssResult.ec0lintStyle.disabledRanges[ruleName],
						newline,
					})(postcssRoot, postcssResult),
				),
			),
		);
	}

	return Promise.all(performRules);
}

/**
 * There are currently some bugs in the autofixer of ec0lintStyle.
 * The autofixer does not yet adhere to ec0lint-style-disable comments, so if there are disabled
 * ranges we can not autofix this document. More info in issue #2643.
 *
 * @param {PostcssResult} postcssResult
 * @returns {boolean}
 */
function isFixCompatible({ ec0lintStyle }) {
	// Check for issue #2643
	if (ec0lintStyle.disabledRanges.all.length) return false;

	return true;
}

module.exports = lintPostcssResult;
