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
		// readdirAsync(dirPath).then(filenames => {
		// 	filenames.forEach(file => {
		// 		let filePath = dirPath + file;
		// 		readFileAsync(filePath).then( {
		// 			if (err) {
		// 				throw err;
		// 			}
		// 			console.log("im here");
		// 			let fileSchema = JSON.parse(data);
		// 			if (fileSchema) schema = schema.concat(fileSchema);
		// 		});
		// 	})
		// }).then(() => {
		// 	console.log("schema");
		// 	console.log(schema);
		// 	complete(schema);
		// });
		readDirAsync(dirPath)
			.then(function(fileNames) {
				let absoFileNames = [];
				fileNames.forEach(function(fileName) {
					absoFileNames.push(dirPath + fileName);
				});
				return Promise.all(absoFileNames.map(readFileAsync));
				//return Promise.all(filenames.map(readFileAsync));
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
		//let microscopesFiles = [];
		let microscopesDB = {};
		// fs.readdir(dirPath, (err, files) => {
		// 	if (err) {
		// 		throw err;
		// 	}
		// 	files.forEach(file => {
		// 		let filePath = dirPath + file;
		// 		fs.readFile(filePath, function read(err, data) {
		// 			if (err) {
		// 				throw err;
		// 			}
		// 			let obj = JSON.parse(data);
		// 			microscopesDB[obj.name + "_" + obj.id] = obj;
		// 		});
		// 	});
		// }).then(() => {
		// 	complete(microscopesDB);
		// });

		readDirAsync(dirPath)
			.then(function(fileNames) {
				let absoFileNames = [];
				fileNames.forEach(function(fileName) {
					absoFileNames.push(dirPath + fileName);
				});
				return Promise.all(absoFileNames.map(readFileAsync));
				//return Promise.all(filenames.map(readFileAsync));
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
