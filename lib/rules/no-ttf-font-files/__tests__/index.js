'use strict';

const { messages, ruleName } = require('..');
const calculateCO2FontFilesReduction = require('../../../../scripts/co2-module');

testRule({
	ruleName,
	config: [true],

	accept: [
		{
			code: "@font-face { font-family: 'foo'; src: url('lib/testResources/foo.woff'); }",
		},
		{
			code: '@font-face {\n font-family: "MyFont"; src: url("lib/testResources/myfont.woff2") format("woff2");\n}',
		},
		{
			code:
				'@font-face {\n' +
				'font-family: dashicons;\n' +
				'src: url(data:application/font-woff;charset=utf-8;base64, ABCDEF==) format("woff"),\n' +
				'url(../lib/testResources/.woff) format("truetype"),\n' +
				'url(../fonts/dashicons.svg#dashicons) format("svg");\n' +
				'font-weight: normal;\n' +
				'font-style: normal;\n' +
				'}',
		},
	],

	reject: [
		{
			code: "@font-face { font-family: 'foo'; src: url('lib/testResources/foo.ttf'); }",
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2FontFilesReduction(
				'lib/testResources/foo.ttf',
			).toFixed(2)}g. (${ruleName})`,
			line: 1,
			column: 43,
		},
		{
			code: '@font-face {\n font-family: "MyFont"; src: url("lib/testResources/myfont.ttf") format("ttf");\n}',
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2FontFilesReduction(
				'lib/testResources/myfont.ttf',
			).toFixed(2)}g. (${ruleName})`,
			line: 2,
			column: 34,
		},
		{
			code:
				'@font-face {\n' +
				'font-family: dashicons;\n' +
				'src: url("lib/testResources/myfont.ttf") format("ttf");\n' +
				'font-weight: normal;\n' +
				'font-style: normal;\n' +
				'}',
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2FontFilesReduction(
				'lib/testResources/myfont.ttf',
			).toFixed(2)}g. (${ruleName})`,
			line: 3,
			column: 10,
		},
		{
			code: "@font-face { font-family: 'foo'; src: url('lib/testResources/nonExisting.ttf'); }",
			message:
				'Format of the custom font can be changed to WOFF or WOFF2. Your file can be converted online at https://cloudconvert.com/. (no-ttf-font-files)',
			line: 1,
			column: 43,
		},
	],
});
