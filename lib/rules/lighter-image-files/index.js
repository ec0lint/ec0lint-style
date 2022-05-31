'use strict';

const functionArgumentsSearch = require('../../utils/functionArgumentsSearch');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');

const ruleName = 'lighter-image-files';

const messages = ruleMessages(ruleName, {
	rejected:
		'Format of image files can be changed to JPEG. CO2 reduction: up to 95% of the image file.',
});

const meta = {
	url: 'TODO',
};

/** @type {import('stylelint').Rule} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) {
			return;
		}

		root.walkDecls((decl) => {
			functionArgumentsSearch(decl.toString().toLowerCase(), 'url', (args, index) => {
				const url = args.trim().replace(/^['"]+|['"]+$/g, '');

				if (
					!url.includes('.ppm') ||
					!url.includes('.ps') ||
					!url.includes('.rgb') ||
					!url.includes('.png')
				) {
					return;
				}

				report({
					message: messages.rejected,
					node: decl,
					index,
					result,
					ruleName,
				});
			});
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;
module.exports = rule;
