'use strict';

const createStylelint = require('./createStylelint');
const path = require('path');

/** @typedef {import('ec0lint-style').PostcssPluginOptions} PostcssPluginOptions */
/** @typedef {import('ec0lint-style').Config} StylelintConfig */

/**
 * @type {import('postcss').PluginCreator<PostcssPluginOptions>}
 * */
module.exports = (options = {}) => {
	const [cwd, tailoredOptions] = isConfig(options)
		? [process.cwd(), { config: options }]
		: [options.cwd || process.cwd(), options];
	const ec0lintStyle = createStylelint(tailoredOptions);

	return {
		postcssPlugin: 'ec0lint-style',
		Once(root, { result }) {
			let filePath = root.source && root.source.input.file;

			if (filePath && !path.isAbsolute(filePath)) {
				filePath = path.join(cwd, filePath);
			}

			return ec0lintStyle._lintSource({
				filePath,
				existingPostcssResult: result,
			});
		},
	};
};

module.exports.postcss = true;

/**
 * @param {PostcssPluginOptions} options
 * @returns {options is StylelintConfig}
 */
function isConfig(options) {
	return 'rules' in options;
}
