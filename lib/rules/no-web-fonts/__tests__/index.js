'use strict';

const { messages, ruleName } = require('..');

testRule({
	ruleName,
	config: [true],

	accept: [
		{
			code: '@font-face { font-family: system-ui; }',
			message: messages.rejected,
		},
		{
			code: '@font-face { font-family: system-ui, Verdana; }',
			message: messages.rejected,
		},
		{
			code: '@import url("./foo.woff");',
			message: messages.rejected,
		},
	],

	reject: [
		{
			code: "@font-face { font-family: 'foo'; src: url('/path/to/foo.ttf'); }",
			message: messages.rejected,
		},
		{
			code: '@import url("www.foo-font.com");',
			message: messages.rejected,
		},
	],
});
