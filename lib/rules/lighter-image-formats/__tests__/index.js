'use strict';

const { messages, ruleName } = require('..');
const calculateCO2ImageFilesReduction = require('../../../../scripts/co2-module');

testRule({
	ruleName,
	config: [true],

	accept: [
		{
			code: "background-image: url('lib/testResources/image.svg')",
		},
		{
			code: "background-image: url('lib/testResources/image.webp')",
		},
		{
			code: "background-image: url('lib/testResources/image.avif')",
		},
		{
			code: "background-image: url('lib/testResources/image.jpg')",
		},
	],

	reject: [
		{
			code: "background-image: url('lib/testResources/image.ppm')",
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2ImageFilesReduction(
				'lib/testResources/image.ppm',
			).toFixed(2)}g. (${ruleName})`,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('lib/testResources/image.ps')",
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2ImageFilesReduction(
				'lib/testResources/image.ps',
			).toFixed(2)}g. (${ruleName})`,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('lib/testResources/image.rgb')",
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2ImageFilesReduction(
				'lib/testResources/image.rgb',
			).toFixed(2)}g. (${ruleName})`,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('lib/testResources/image.gif')",
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2ImageFilesReduction(
				'lib/testResources/image.gif',
			).toFixed(2)}g (${ruleName})`,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('lib/testResources/image.png')",
			message: `${messages.rejected.split(` (${ruleName})`)[0]}${calculateCO2ImageFilesReduction(
				'lib/testResources/image.png',
			).toFixed(2)}g. (${ruleName})`,
			line: 1,
			column: 23,
		},
		{
			code: "background-image: url('lib/testResources/nonExistingImage.png')",
			message:
				'Format of image files can be changed to WebP or SVG. Your image can be converted online at https://cloudconvert.com/. (lighter-image-files)',
			line: 1,
			column: 23,
		},
	],
});
