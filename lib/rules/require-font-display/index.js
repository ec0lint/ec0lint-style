'use strict';

const isStandardSyntaxAtRule = require('../../utils/isStandardSyntaxAtRule');
const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const ruleName = 'require-font-display';

const messages = ruleMessages(ruleName, {
	rejected: 'No font-display property inside @font-face rule.',
});

const meta = {
	url: 'TODO',
};

/** @type {import('stylelint').Rule} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
		});

		if (!validOptions) {
			return;
		}

		root.walkAtRules((atRule) => {
			if (!isStandardSyntaxAtRule(atRule)) {
				return;
			}

			const { name, nodes } = atRule;
			const atRuleName = name.toLowerCase();
			const isFontFace = atRuleName === '@font-family';
			const hasProperty = nodes.find(
				(node) => node.type === 'decl' && node.prop.toLowerCase() === 'font-display',
			);

			if (isFontFace && !hasProperty) {
				report({
					message: messages.rejected,
					node: root.nodes[0],
					result,
					ruleName,
				});
			}
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;
module.exports = rule;
