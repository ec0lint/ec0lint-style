'use strict';

const _importLazy = require('import-lazy');

const importLazy = _importLazy(require);

/** @type {typeof import('stylelint').rules} */
const rules = {
	'no-ttf-font-files': importLazy('./no-ttf-font-files'),
	'require-font-display': importLazy('./require-font-display'),
};

module.exports = rules;
