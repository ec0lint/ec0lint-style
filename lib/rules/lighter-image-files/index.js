'use strict';

const functionArgumentsSearch = require('../../utils/functionArgumentsSearch');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const calculateCO2ImageFilesReduction = require('../../../scripts/co2-module');

const ruleName = 'lighter-image-files';

const messages = ruleMessages(ruleName, {
	rejected:
		'Format of image files can be changed to WebP or SVG. CO2 reduction: up to 99% of the image file.\n' +
		'Estimated CO2 reduction that you can achieve by converting your file is: ',
});

const meta = {
	url: 'http://ec0lint.com/features/lighter-image-files',
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

				if (
					!url.includes('.tiff') &&
					!url.includes('.ps') &&
					!url.includes('.tif') &&
					!url.includes('.png') &&
					!url.includes('.psd')
				) {
					return;
				}

				report({
					message: `${messages.rejected} ${calculateCO2ImageFilesReduction(url).toString()} g.`,
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
