'use strict';

const { messages, ruleName } = require('..');

testRule({
	ruleName,
	config: [true],

	accept: [
		{
			code: 'background-color:black',
		},
		{
			code: 'background-color:#000000',
		},
		{
			code: 'background-color:hsl(0, 0%, 0%)',
		},
		{
			code: 'background-color:rgb(0,0,0)',
		},
	],

	reject: [
		{
			code: 'background-color:white',
			message: messages.rejected,
		},
		{
			code: 'background-color:#ffffff',
			message: messages.rejected,
		},
		{
			code: 'background-color:hsl(0,100%,100%)',
			message: messages.rejected,
		},
		{
			code: 'background-color:rgb(255,255,255)',
			message: messages.rejected,
		},
	],
});
