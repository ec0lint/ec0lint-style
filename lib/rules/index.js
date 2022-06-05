'use strict';

const _importLazy = require('import-lazy');

const importLazy = _importLazy(require);

/** @type {typeof import('ec0lint-css').rules} */
const rules = {
	'no-ttf-font-files': importLazy('./no-ttf-font-files'),
	'lighter-image-files': importLazy('./lighter-image-files'),
};

module.exports = rules;
