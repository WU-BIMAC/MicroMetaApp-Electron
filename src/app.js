import React from "react";
import ReactDOM from "react-dom";

import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

import MicroscopeMetadataTool from "4dn-microscopy-metadata-tool";

let fs = window.require("fs");
let electron = window.require("electron");
let path = window.require("path");
let dialog = electron.remote.dialog;
let mainWindow = electron.BrowserWindow;

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

class MicroscopeMetadataToolWorkingDirectoryChooser extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isPathValid: false
		};
		this.onClickSelectWorkingDirectory = this.onClickSelectWorkingDirectory.bind(
			this
		);
		this.onClickConfirmWorkingDirectory = this.onClickConfirmWorkingDirectory.bind(
			this
		);
		this.handleWorkingDirectoryChange = this.handleWorkingDirectoryChange.bind(
			this
		);

		this.inputRef = React.createRef();
	}

	onClickConfirmWorkingDirectory() {
		let value = this.inputRef.current.value;
		this.props.handleConfirmWorkingDirectory(value);
	}

	onClickSelectWorkingDirectory() {
		let value = this.inputRef.current.value;
		dialog.showOpenDialog(
			mainWindow,
			{
				properties: ["openDirectory", `defaultPath: ${value}`]
			},
			this.props.handleSelectWorkingDirectory
		);
	}

	handleWorkingDirectoryChange() {
		let value = this.inputRef.current.value;
		console.log("testing: " + value);
		this.props.handleSelectWorkingDirectory(value);
	}

	render() {
		let workingDirectory = null;
		let isPathValid = false;
		if (this.props.workingDirectory) {
			workingDirectory = path.resolve(this.props.workingDirectory);
			if (fs.existsSync(workingDirectory)) {
				isPathValid = true;
			}
		}
		let buttonStyle = {
			width: "200px",
			height: "50px",
			padding: "5px",
			margin: "5px"
		};
		let containerStyle = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: this.props.width,
			height: this.props.height,
			alignItems: "center"
		};
		let inputContainerStyle = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "row",
			flexWrap: "wrap",
			alignItems: "center",
			width: "410px",
			height: "50px"
		};
		let buttonContainerStyle = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "row",
			flexWrap: "wrap",
			alignItems: "center"
		};
		let controlStyle = {
			height: "50px"
		};
		if (!isPathValid) {
			controlStyle = Object.assign(controlStyle, {
				background: "red"
			});
		} else {
			controlStyle = Object.assign(controlStyle, {
				background: "green"
			});
		}
		return (
			<div style={containerStyle}>
				<InputGroup className="mb-3" style={inputContainerStyle}>
					<FormControl
						ref={this.inputRef}
						onChange={this.handleWorkingDirectoryChange}
						aria-label="workingDirectory"
						aria-describedby="basic-addon2"
						size="lg"
						value={workingDirectory}
					/>
					<InputGroup.Append>
						<InputGroup.Text style={controlStyle}>
							{isPathValid ? <div>&#10004;</div> : <div>&#10006;</div>}
						</InputGroup.Text>
					</InputGroup.Append>
				</InputGroup>
				<div style={buttonContainerStyle}>
					<Button
						onClick={this.onClickSelectWorkingDirectory}
						style={buttonStyle}
						size="lg"
					>
						Browse
					</Button>
					<Button
						onClick={this.onClickConfirmWorkingDirectory}
						style={buttonStyle}
						size="lg"
						disabled={!isPathValid}
					>
						Confirm
					</Button>
				</div>
			</div>
		);
	}
}

class MicroscopeMetadataToolComponent extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			workingDirectory: "./",
			workingDirectoryConfirmed: false
		};
		this.onLoadSchema = this.onLoadSchema.bind(this);
		this.onLoadMicroscopes = this.onLoadMicroscopes.bind(this);

		this.handleSelectWorkingDirectory = this.handleSelectWorkingDirectory.bind(
			this
		);

		window.addEventListener("resize", this.render);
	}

	onLoadSchema(complete) {
		let workingDirectory = this.state.workingDirectory;
		let dirPath = workingDirectory + "schemas/";
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
		let workingDirectory = this.state.workingDirectory;
		let dirPath = workingDirectory + "microscopes/";
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

	handleSelectWorkingDirectory(filePath) {
		if (filePath) {
			console.log(filePath);
			this.setState({ workingDirectory: filePath });
		}
	}

	handleConfirmWorkingDirectory(value) {
		this.setState({ workingDirectory: value, workingDirectoryConfirmed: true });
	}

	render() {
		let dims = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		let workingDirectory = this.state.workingDirectory;
		let workingDirectoryConfirmed = this.state.workingDirectoryConfirmed;
		if (!workingDirectoryConfirmed) {
			//TODO add component that let user select folder
			return (
				<MicroscopeMetadataToolWorkingDirectoryChooser
					width={dims.width}
					height={dims.height}
					workingDirectory={workingDirectory}
					handleSelectWorkingDirectory={this.handleSelectWorkingDirectory}
				/>
			);
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
