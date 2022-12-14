'use strict';

const isStandardSyntaxAtRule = require('../../utils/isStandardSyntaxAtRule');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const ruleName = 'require-system-fonts';

const messages = ruleMessages(ruleName, {
	rejected: 'Use only system-ui font family.',
});

const meta = {
	url: 'http://ec0lint.com/features/require-system-fonts',
};

/** @type {import('ec0lint-style').Rule} */
const rule = (primary) => {
	const ruleChecker = (ruleToCheck, root, result) => {
		if (!isStandardSyntaxAtRule(ruleToCheck)) {
			return;
		}

		const { name, nodes, params } = ruleToCheck;

		const atRuleName = name && name.toLowerCase();
		const isImport = atRuleName === 'import';
		const isFontFace = atRuleName === 'font-face';
		const shouldThrow = isFontFace
			? nodes.find((node) => node.type === 'decl' && node.prop === 'src')
			: // eslint-disable-next-line regexp/no-useless-character-class
			  !params.match(/url[(]["].+[.]((ttf)|(woff))["][)]$/gm) && isImport;

		if (shouldThrow) {
			report({
				message: messages.rejected,
				node: root.nodes[0],
				result,
				ruleName,
			});
		}
	};

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
		});

		if (!validOptions) {
			return;
		}

		root.walkAtRules((atRule) => {
			ruleChecker(atRule, root, result);
		});
		// root.walkRules((walkRule) => {
		// 	ruleChecker(walkRule, root, result);
		// });
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;
module.exports = rule;
