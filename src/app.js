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

		window.addEventListener("resize", this.render);
	}

	onLoadSchema(complete) {
		let workingFolder = this.state.workingFolder;
		//let schemaFile = fs.readFile(workingFolder + "testSchema.json");
		let filePath = workingFolder + "testSchema.json";
		let schemaFile = null;
		fs.readFile(filePath, function read(err, data) {
			if (err) {
				throw err;
			}
			let schemaFile = JSON.parse(data);
			complete(schemaFile);
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
			let microscopesPath = workingFolder + "microscopes/";
			let microscopesFiles = [];
			fs.readdir(microscopesPath, (err, files) => {
				files.forEach(file => {
					microscopesFiles.push(file);
				});
			});
			console.log(microscopesFiles);
			let microscopesDB = {};
			Object.keys(microscopesFiles).forEach(index => {
				//DO something here;
				let file = microscopesFiles[index];
				fs.readFile(file, function read(err, data) {
					if (err) {
						throw err;
					}
					let obj = JSON.parse(data);
					microscopesDB[obj.name + "_" + obj.id] = obj;
				});
			});

			return (
				<MicroscopeMetadataTool
					width={dims.width}
					height={dims.height}
					onLoadSchema={this.onLoadSchema}
					imagesPath={"./../public/assets/"}
					microscopes={microscopesDB}
				/>
			);
		}
	}
}
