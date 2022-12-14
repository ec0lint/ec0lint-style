'use strict';

const _importLazy = require('import-lazy');

const importLazy = _importLazy(require);

/** @type {typeof import('ec0lint-style').rules} */
const rules = {
	'no-ttf-font-files': importLazy('./no-ttf-font-files'),
	'lighter-image-files': importLazy('./lighter-image-files'),
	'require-font-display': importLazy('./require-font-display'),
	'require-system-fonts': importLazy('./require-system-fonts'),
};

module.exports = rules;
