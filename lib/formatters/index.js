'use strict';

const _importLazy = require('import-lazy');

const importLazy = _importLazy(require);

/** @type {typeof import('ec0lint-style').formatters} */
const formatters = {
	compact: importLazy('./compactFormatter'),
	json: importLazy('./jsonFormatter'),
	string: importLazy('./stringFormatter'),
	tap: importLazy('./tapFormatter'),
	unix: importLazy('./unixFormatter'),
	verbose: importLazy('./verboseFormatter'),
};

module.exports = formatters;
