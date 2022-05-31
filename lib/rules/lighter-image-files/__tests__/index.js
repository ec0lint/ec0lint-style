'use strict';

const { messages, ruleName } = require('..');

testRule({
	ruleName,
	config: [true],

	accept: [
		{
			code: "background-image: url('image.gif')",
		},
		{
			code: "background-image: url('image.jpg')",
		},
	],

	reject: [
		{
			code: "background-image: url('image.ppm')",
			message: messages.rejected,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('image.ps')",
			message: messages.rejected,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('image.rgb')",
			message: messages.rejected,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('image.png')",
			message: messages.rejected,
			line: 1,
			column: 23,
		},
	],
});
