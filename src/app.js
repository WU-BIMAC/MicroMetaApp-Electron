import React from "react";
import ReactDOM from "react-dom";

import MicroscopeMetadataTool from "4dn-microscopy-metadata-tool";

const fs = window.require("fs");

window.onload = () => {
	ReactDOM.render(
		<MicroscopeMetadataToolComponent />,
		document.getElementById("root")
	);
};

// make Promise version of fs.readdir()
function readDirAsync(dirname) {
	return new Promise(function(resolve, reject) {
		fs.readdir(dirname, function(err, filenames) {
			if (err) reject(err);
			else resolve(filenames);
		});
	});
}

// make Promise version of fs.readFile()
function readFileAsync(filename) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filename, function(err, data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}

class MicroscopeMetadataToolComponent extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			workingFolder: null
		};
		this.onLoadSchema = this.onLoadSchema.bind(this);
		this.onLoadMicroscopes = this.onLoadMicroscopes.bind(this);

		window.addEventListener("resize", this.render);
	}

	onLoadSchema(complete) {
		let workingFolder = this.state.workingFolder;
		let dirPath = workingFolder + "schemas/";
		let schema = [];
		readDirAsync(dirPath)
			.then(function(fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function(fileName) {
					absoluteFileNames.push(dirPath + fileName);
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function(files) {
				files.forEach(function(file) {
					var fileSchema = JSON.parse(file);
					if (fileSchema !== null) schema = schema.concat(fileSchema);
				});
				complete(schema);
			});
	}

	onLoadMicroscopes(complete) {
		let workingFolder = this.state.workingFolder;
		let dirPath = workingFolder + "microscopes/";
		let microscopesDB = {};
		readDirAsync(dirPath)
			.then(function(fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function(fileName) {
					absoluteFileNames.push(dirPath + fileName);
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function(files) {
				files.forEach(function(file) {
					var microscope = JSON.parse(file);
					if (microscope !== null)
						microscopesDB[microscope.name + "_" + microscope.id] = microscope;
				});
				complete(microscopesDB);
			});
	}

	render() {
		let dims = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		let workingFolder = this.state.workingFolder;
		if (workingFolder === null) {
			//TODO add component that let user select folder
			workingFolder = "./";
			this.setState({ workingFolder: workingFolder });
			return null;
		} else {
			return (
				<MicroscopeMetadataTool
					width={dims.width}
					height={dims.height}
					onLoadSchema={this.onLoadSchema}
					onLoadMicroscopes={this.onLoadMicroscopes}
					imagesPath={"./../public/assets/"}
				/>
			);
		}
	}
}
