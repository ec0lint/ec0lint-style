'use strict';

const functionArgumentsSearch = require('../../utils/functionArgumentsSearch');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const calculateCO2FontFilesReduction = require('../../../scripts/co2-module');

const ruleName = 'no-ttf-font-files';

const messages = ruleMessages(ruleName, {
	rejected:
		'Format of the custom font can be changed to WOFF or WOFF2. Your file can be converted online at https://cloudconvert.com/\n' +
		'Estimated CO2 reduction that you can achieve by converting your file is: ',
});

const meta = {
	url: 'http://ec0lint.com/features/no-ttf-font-files',
};

/** @type {import('ec0lint-style').Rule} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) {
			return;
		}

		root.walkDecls((decl) => {
			functionArgumentsSearch(decl.toString(), 'url', (args, index) => {
				const url = args.trim().replace(/^['"]+|['"]+$/g, '');

				if (url.length < 4 || !url.includes('.ttf')) {
					return;
				}

				const co2Reduction = calculateCO2FontFilesReduction(url).toFixed(2);

				const message = ruleMessages(ruleName, {
					rejected:
						'Format of the custom font can be changed to WOFF or WOFF2. Your file can be converted online at https://cloudconvert.com/\n' +
						`Estimated CO2 reduction that you can achieve by converting your file is: ${co2Reduction}g`,
				});

				report({
					message: message.rejected,
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
