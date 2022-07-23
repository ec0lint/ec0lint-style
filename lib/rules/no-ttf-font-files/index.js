'use strict';

const functionArgumentsSearch = require('../../utils/functionArgumentsSearch');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');

const ruleName = 'no-ttf-font-files';

const messages = ruleMessages(ruleName, {
	rejected:
		'Format of the custom font can be changed to WOFF or WOFF2. CO2 reduction: up to 80% of the font file.\n' +
		'Your file can be converted online at https://cloudconvert.com/',
});

const meta = {
	url: 'http://ec0lint.com/features/no-ttf-font-files',
};

/** @type {import('ec0lint-css').Rule} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) {
			return;
		}

		root.walkDecls((decl) => {
			functionArgumentsSearch(decl.toString().toLowerCase(), 'url', (args, index) => {
				const url = args.trim().replace(/^['"]+|['"]+$/g, '');

				if (url.length < 4 || !url.includes('.ttf')) {
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
