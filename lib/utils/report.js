'use strict';

/** @typedef {import('ec0lint-style').Problem} Problem */

/**
 * Report a problem.
 *
 * This function accounts for `disabledRanges` attached to the result.
 * That is, if the reported problem is within a disabledRange,
 * it is ignored. Otherwise, it is attached to the result as a
 * postcss warning.
 *
 * It also accounts for the rule's severity.
 *
 * You *must* pass *either* a node or a line number.
 * @param {Problem} problem
 * @returns {void}
 */
function report(problem) {
	const ruleName = problem.ruleName;
	const result = problem.result;
	const message = problem.message;
	const line = problem.line;
	const node = problem.node;
	const index = problem.index;
	const word = problem.word;

	result.ec0lintStyle = result.ec0lintStyle || {
		ruleSeverities: {},
		customMessages: {},
		ruleMetadata: {},
	};

	// In quiet mode, mere warnings are ignored
	if (result.ec0lintStyle.quiet && result.ec0lintStyle.ruleSeverities[ruleName] !== 'error') {
		return;
	}

	// If a line is not passed, use the node.positionBy method to get the
	// line number that the complaint pertains to
	const startLine = line || node.positionBy({ index }).line;

	const { ignoreDisables } = result.ec0lintStyle.config || {};

	if (result.ec0lintStyle.disabledRanges) {
		const ranges =
			result.ec0lintStyle.disabledRanges[ruleName] || result.ec0lintStyle.disabledRanges.all;

		for (const range of ranges) {
			if (
				// If the problem is within a disabledRange,
				// and that disabledRange's rules include this one,
				// do not register a warning
				range.start <= startLine &&
				(range.end === undefined || range.end >= startLine) &&
				(!range.rules || range.rules.includes(ruleName))
			) {
				// Collect disabled warnings
				// Used to report `needlessDisables` in subsequent processing.
				const disabledWarnings =
					result.ec0lintStyle.disabledWarnings || (result.ec0lintStyle.disabledWarnings = []);

				disabledWarnings.push({
					rule: ruleName,
					line: startLine,
				});

				if (!ignoreDisables) {
					return;
				}

				break;
			}
		}
	}

	const severity =
		result.ec0lintStyle.ruleSeverities && result.ec0lintStyle.ruleSeverities[ruleName];

	if (!result.ec0lintStyle.stylelintError && severity === 'error') {
		result.ec0lintStyle.stylelintError = true;
	}

	/** @type {import('ec0lint-style').WarningOptions} */
	const warningProperties = {
		severity,
		rule: ruleName,
	};

	if (node) {
		warningProperties.node = node;
	}

	if (index) {
		warningProperties.index = index;
	}

	if (word) {
		warningProperties.word = word;
	}

	const warningMessage =
		(result.ec0lintStyle.customMessages && result.ec0lintStyle.customMessages[ruleName]) || message;

	result.warn(warningMessage, warningProperties);
}

module.exports = /** @type {typeof import('ec0lint-style').utils.report} */ (report);
