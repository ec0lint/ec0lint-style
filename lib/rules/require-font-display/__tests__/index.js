'use strict';

const { messages, ruleName } = require('..');

testRule({
	ruleName,
	config: [true],

	accept: [
		{
			code: "@font-face { font-family: 'foo'; font-display: block; src: url('/path/to/foo.woff'); }",
		},
		{
			code: "@font-face {\n font-family: 'MyFont'; font-display: block; src: url('myfont.woff2') format('woff2');\n}",
		},
		{
			code:
				'font-family: dashicons;\n' +
				'src: url(data:application/font-woff;charset=utf-8;base64, ABCDEF==) format("woff"),\n' +
				'url(../fonts/dashicons.woff) format("truetype"),\n' +
				'url(../fonts/dashicons.svg#dashicons) format("svg");\n' +
				'font-weight: normal;\n' +
				'font-style: normal;',
		},
	],

	reject: [
		{
			code: "@font-face { font-family: 'foo'; src: url('/path/to/foo.ttf'); }",
			message: messages.rejected,
		},
		{
			code: '@font-face {\n font-family: "MyFont"; src: url("myfont.ttf") format("ttf");\n}',
			message: messages.rejected,
		},
		{
			code:
				'@font-face {\n' +
				'font-family: dashicons;\n' +
				'src: url("myfont.ttf") format("ttf");\n' +
				'font-weight: normal;\n' +
				'font-style: normal;\n' +
				'}',
			message: messages.rejected,
		},
	],
});
