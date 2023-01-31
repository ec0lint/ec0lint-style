/**
 * @author Aleksandra Borowska <https://github.com/Ola2808-Boro>
 */
'use strict';

const report = require('../../utils/report');
const ruleMessages = require('../../utils/ruleMessages');
const validateOptions = require('../../utils/validateOptions');
const isStandardSyntaxDeclaration = require('../../utils/isStandardSyntaxDeclaration');
const ruleName = 'background-color-validation';

const messages = ruleMessages(ruleName, {
	rejected:
		`Don't use this color as background-color property. Level of energy-consuming in OLED's screen is depend at luminance of color.\n` +
		`If you want to create more sustainable website use colors with lower luminance`,
});

const meta = {
	url: 'http://ec0lint.com/features/background-color-validation',
};

/** @type {import('ec0lint-style').Rule} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) {
			return;
		}

		root.walkDecls((decl) => {
			if (
				!decl.prop.toString().includes('background-color') &&
				!isStandardSyntaxDeclaration(decl)
			) {
				return;
			}

			const message = ruleMessages(ruleName, {
				rejected:
					`Don't use this color as background-color property. Level of energy-consuming in OLED's screen is depend at luminance of color.\n` +
					`If you want to create more sustainable website use colors with lower luminance`,
			});

			const Colors = {
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

			//convert HEX to RGB
			if (decl.value.match(/^#([\da-f]{6}){1,2}$/i)) {
				// 3 digits
				if (decl.value.length === 4) {
					let color = {
						r: parseInt(decl.value[1] + decl.value[1], 16),
						g: parseInt(decl.value[2] + decl.value[2], 16),
						b: parseInt(decl.value[3] + decl.value[3], 16),
					};

					if (color.r < 204 && color.g < 204 && color.b < 153) return;

					// 6 digits
				} else if (decl.value.length === 7) {
					let color = {
						r: parseInt(decl.value[1] + decl.value[2], 16),
						g: parseInt(decl.value[3] + decl.value[4], 16),
						b: parseInt(decl.value[5] + decl.value[6], 16),
					};

					if (color.r < 204 && color.g < 204 && color.b < 153) return;
				}
			} //check rgb
			else if (
				decl.value.match(
					/^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i,
				)
			) {
				let colorRGb = decl.value;
				// @ts-ignore
				const [r, g, b] = colorRGb.match(/\d+/g).map(Number);

				let color = {
					r,
					g,
					b,
				};

				if (color.r < 204 && color.g < 204 && color.b < 153) return;
			}

			//convert HSL to RGB
			else if (
				decl.value.match(
					/^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i,
				)
			) {
				let sep = decl.value.indexOf(',') > -1 ? ',' : ' ';

				// @ts-ignore
				decl.value = decl.value.substring(4).split(')')[0].split(sep);

				let h = decl.value[0];
				// @ts-ignore
				let s = decl.value[1].substring(0, decl.value[1].length - 1) / 100;
				// @ts-ignore
				let l = decl.value[2].substring(0, decl.value[2].length - 1) / 100;

				let c = (1 - Math.abs(2 * l - 1)) * s;

				let x = c * (1 - Math.abs(((Number(h) / 60) % 2) - 1));
				let m = l - c / 2;
				let r = 0;
				let g = 0;
				let b = 0;

				if (0 <= Number(h) && Number(h) < 60) {
					r = c;
					g = x;
					b = 0;
				} else if (60 <= Number(h) && Number(h) < 120) {
					r = x;
					g = c;
					b = 0;
				} else if (120 <= Number(h) && Number(h) < 180) {
					r = 0;
					g = c;
					b = x;
				} else if (180 <= Number(h) && Number(h) < 240) {
					r = 0;
					g = x;
					b = c;
				} else if (240 <= Number(h) && Number(h) < 300) {
					r = x;
					g = 0;
					b = c;
				} else if (300 <= Number(h) && Number(h) < 360) {
					r = c;
					g = 0;
					b = x;
				}

				let color = {
					r: Math.round((r + m) * 255),
					g: Math.round((g + m) * 255),
					b: Math.round((b + m) * 255),
				};

				if (color.r < 204 && color.g < 204 && color.b < 153) return;

				// @ts-ignore
			} else if (!Object.values(Colors).includes(decl.value.toString())) {
				return;
			}

			report({
				message: message.rejected,
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
