/**
 * @author Aleksandra Borowska <https://github.com/Ola2808-Boro>
 */
'use strict';

const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const isStandardSyntaxDeclaration = require('../../utils/isStandardSyntaxDeclaration');
const ruleName = 'efficient-background-color';

const messages = ruleMessages(ruleName, {
	rejected:
		`Don't use this color as background-color property. Level of energy-consuming in an OLED's screen depends on the luminance of color.\n` +
		`If you want to create a more sustainable website use colors with lower luminance.`,
});

const meta = {
	url: 'http://ec0lint.com/features/efficient-background-color ',
};

/** @type {import('ec0lint-style').Rule} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) return;

		root.walkDecls((decl) => {
			if (
				!decl.prop.toString().includes('background-color') &&
				!isStandardSyntaxDeclaration(decl)
			) {
				return;
			}

			const energyEfficientColor = {
				r: 204,
				g: 204,
				b: 153,
			};
			const colorRegex = {
				hex: /^#([\da-f]{6}){1,2}$/i,
				hsl: /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i,
				rgb: /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i,
			};
			const unefficientColors = {
				white: 'white',
				blue: 'blue',
				aque: 'aque',
				magenta: 'magenta',
				lime: 'lime',
				cream: 'cream',
				yellow: 'yellow',
				violet: 'violet',
				red: 'red',
				orange: 'orange',
			};

			const convertHEXToRGb = (colorName) => {
				const color = {
					r: 0,
					g: 0,
					b: 0,
				};

				if (colorName.length === 4) {
					color.r = parseInt(decl.value[1] + decl.value[1], 16);
					color.g = parseInt(decl.value[2] + decl.value[2], 16);
					color.b = parseInt(decl.value[3] + decl.value[3], 16);
				} else if (decl.value.length === 7) {
					color.r = parseInt(decl.value[1] + decl.value[2], 16);
					color.g = parseInt(decl.value[3] + decl.value[4], 16);
					color.b = parseInt(decl.value[5] + decl.value[6], 16);
				}

				return color;
			};

			const convertHSLInStringToNewStatements = (colorName) => {
				let sep = colorName.indexOf(',') > -1 ? ',' : ' ';

				colorName = colorName.substring(4).split(')')[0].split(sep);

				let h = colorName[0];

				let s = colorName[1].substring(0, colorName[1].length - 1) / 100;

				let l = colorName[2].substring(0, colorName[2].length - 1) / 100;

				return [h, s, l];
			};

			const convertHSLToRGB = (colorName) => {
				const [h, s, l] = convertHSLInStringToNewStatements(colorName);

				let chroma = (1 - Math.abs(2 * l - 1)) * s;

				let secondLargestComponentOfColor = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
				let amountToAddToChannelToMatchTheLightness = l - chroma / 2;

				let r = 0;
				let g = 0;
				let b = 0;

				if (0 <= h && h < 60) {
					r = chroma;
					g = secondLargestComponentOfColor;
					b = 0;
				} else if (60 <= h && h < 120) {
					r = secondLargestComponentOfColor;
					g = chroma;
					b = 0;
				} else if (120 <= h && h < 180) {
					r = 0;
					g = chroma;
					b = secondLargestComponentOfColor;
				} else if (180 <= h && h < 240) {
					r = 0;
					g = secondLargestComponentOfColor;
					b = chroma;
				} else if (240 <= h && h < 300) {
					r = secondLargestComponentOfColor;
					g = 0;
					b = chroma;
				} else if (300 <= h && h < 360) {
					r = chroma;
					g = 0;
					b = secondLargestComponentOfColor;
				}

				const color = {
					r: Math.round((r + amountToAddToChannelToMatchTheLightness) * 255),
					g: Math.round((g + amountToAddToChannelToMatchTheLightness) * 255),
					b: Math.round((b + amountToAddToChannelToMatchTheLightness) * 255),
				};

				return color;
			};

			if (decl.value.match(colorRegex.hex)) {
				const color = convertHEXToRGb(decl.value);

				if (
					color.r < energyEfficientColor.r &&
					color.g < energyEfficientColor.g &&
					color.b < energyEfficientColor.b
				)
					return;
			} else if (decl.value.match(colorRegex.rgb)) {
				let colorRGb = decl.value;
				// @ts-ignore
				const [r, g, b] = colorRGb.match(/\d+/g).map(Number);

				const color = {
					r,
					g,
					b,
				};

				if (
					color.r < energyEfficientColor.r &&
					color.g < energyEfficientColor.g &&
					color.b < energyEfficientColor.b
				)
					return;
			} else if (decl.value.match(colorRegex.hsl)) {
				const color = convertHSLToRGB(decl.value);

				if (
					color.r < energyEfficientColor.r &&
					color.g < energyEfficientColor.g &&
					color.b < energyEfficientColor.b
				)
					return;
			} else if (!Object.values(unefficientColors).includes(decl.value.toString())) {
				return;
			}

			report({
				message: messages.rejected,
				node: decl,
				result,
				ruleName,
			});
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;
module.exports = rule;
