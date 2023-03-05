'use strict';

const _importLazy = require('import-lazy');

const importLazy = _importLazy(require);

/** @type {typeof import('ec0lint-style').rules} */
const rules = {
	'no-ttf-font-files': importLazy('./no-ttf-font-files'),
	'lighter-image-formats': importLazy('./lighter-image-formats'),
	'require-font-display': importLazy('./require-font-display'),
	'no-web-fonts': importLazy('./no-web-fonts'),
};

module.exports = rules;
