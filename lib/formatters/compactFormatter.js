'use strict';

/**
 * @type {import('ec0lint-style').Formatter}
 */
const formatter = (results) =>
	results
		.flatMap((result) =>
			result.warnings.map(
				(warning) =>
					`${result.source}: ` +
					`line ${warning.line}, ` +
					`col ${warning.column}, ` +
					`${warning.severity} - ` +
					`${warning.text}`,
			),
		)
		.join('\n');

module.exports = formatter;
