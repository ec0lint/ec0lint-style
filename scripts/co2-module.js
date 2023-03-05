const fs = require('fs'); //Load the filesystem module

function getFileSize(path) {
	const stats = fs.statSync(path);
	const fileSizeInBytes = stats.size;
	//Convert the file size to megabytes

	return fileSizeInBytes / (1024 * 1024 * 1024);
}

function calculateCO2Emission(filesize) {
	return filesize * 442 * 0.81;
}

function calculateCO2FontFilesReduction(path) {
	const fileSize = getFileSize(path);
	const emission = calculateCO2Emission(fileSize);
	const toLowerPath = path.toLowerCase();

	if (toLowerPath.includes('helvetica')) {
		return emission * 0.61;
	}

	if (toLowerPath.includes('tisa')) {
		return emission * 0.61;
	}

	if (toLowerPath.includes('montserrat')) {
		return emission * 0.69;
	}

	if (toLowerPath.includes('playfair')) {
		return emission * 0.69;
	}

	if (toLowerPath.includes('roboto')) {
		return emission * 0.62;
	}

	if (toLowerPath.includes('poppins')) {
		return emission * 0.68;
	}

	if (toLowerPath.includes('merriweather')) {
		return emission * 0.6;
	}

	if (toLowerPath.includes('opensans')) {
		return emission * 0.54;
	}

	if (toLowerPath.includes('lato')) {
		return emission * 0.62;
	}

	if (toLowerPath.includes('oxygen')) {
		return emission * 0.54;
	}

	return emission * 0.62;
}

function calculateCO2ImageFilesReduction(path) {
	const fileSize = getFileSize(path);
	const emission = calculateCO2Emission(fileSize);
	const toLowerPath = path.toLowerCase();

	if (toLowerPath.includes('.png')) {
		return emission * 0.94;
	}

	if (toLowerPath.includes('.tiff')) {
		return emission * 0.98;
	}

	if (toLowerPath.includes('.tif')) {
		return emission * 0.98;
	}

	if (toLowerPath.includes('.psd')) {
		return emission * 0.99;
	}
	if (toLowerPath.includes('.gif')) {
		return emission * 0.88;
	}

	if (toLowerPath.includes('.ps')) {
		return emission * 0.99;
	}

	return emission * 0.97;
}

(module.exports = calculateCO2FontFilesReduction), calculateCO2ImageFilesReduction;
