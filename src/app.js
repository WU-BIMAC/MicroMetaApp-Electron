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
		//let schemaFile = fs.readFile(workingFolder + "testSchema.json");
		let filePath = workingFolder + "testSchema.json";
		fs.readFile(filePath, function read(err, data) {
			if (err) {
				throw err;
			}
			let schemaFile = JSON.parse(data);
			complete(schemaFile);
		});
	}

	onLoadMicroscopes(complete) {
		let workingFolder = this.state.workingFolder;
		let dirPath = workingFolder + "microscopes/";
		//let microscopesFiles = [];
		let microscopesDB = {};
		fs.readdir(dirPath, (err, files) => {
			if (err) {
				throw err;
			}
			files.forEach(file => {
				let filePath = dirPath + file;
				fs.readFile(filePath, function read(err, data) {
					if (err) {
						throw err;
					}
					let obj = JSON.parse(data);
					microscopesDB[obj.name + "_" + obj.id] = obj;
				});
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
			workingFolder = "./public/assets/";
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
