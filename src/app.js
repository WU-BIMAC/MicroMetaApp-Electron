import React from "react";
import ReactDOM from "react-dom";

import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

import MicroscopeMetadataTool from "4dn-microscopy-metadata-tool";

let fs = window.require("fs");
let electron = window.require("electron");
let homePath = electron.remote.app.getPath("home");
let path = window.require("path");
let dialog = electron.remote.dialog;
let mainWindow = electron.BrowserWindow;

let toolDirectory = "MicroscopyMetadataTool";
let schemaDirectory = "schemas";
let microscopeDirectory = "microscopes";

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
				defaultPath: `${value}`,
				properties: ["openDirectory"]
			},
			this.props.handleSelectWorkingDirectory
		);
	}

	handleWorkingDirectoryChange() {
		let value = this.inputRef.current.value;
		this.props.handleSelectWorkingDirectory(value);
	}

	render() {
		let workingDirectory = null;
		let isPathValid = false;
		if (this.props.workingDirectory) {
			workingDirectory = path.resolve(this.props.workingDirectory);
			if (
				fs.existsSync(workingDirectory) &&
				fs.lstatSync(workingDirectory).isDirectory()
			) {
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
			workingDirectoryConfirmed: false,
			windowDimensions: {
				width: window && window.innerWidth,
				height: window && window.innerHeight
			}
		};
		this.onLoadSchema = this.onLoadSchema.bind(this);
		this.onLoadMicroscopes = this.onLoadMicroscopes.bind(this);
		this.onWorkingDirectorySave = this.onWorkingDirectorySave.bind(this);

		this.handleSelectWorkingDirectory = this.handleSelectWorkingDirectory.bind(
			this
		);
		this.handleConfirmWorkingDirectory = this.handleConfirmWorkingDirectory.bind(
			this
		);
		this.copyFiles = this.copyFiles.bind(this);

		this.onWindowResize = this.onWindowResize.bind(this);
	}

	onWindowResize() {
		var windowDimensions = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		this.setState({ windowDimensions });
	}

	componentDidMount() {
		window.addEventListener("resize", this.onWindowResize);
		if (!this.state.windowDimensions.width) {
			this.onWindowResize();
		}

		let oldWorkingDirectory = this.state.workingDirectory;
		let newWorkingDirectory = homePath + path.sep + toolDirectory;
		if (!fs.existsSync(newWorkingDirectory)) {
			fs.mkdirSync(newWorkingDirectory);
		}
		let oldSchemaDirectory =
			oldWorkingDirectory + path.sep + schemaDirectory + path.sep;
		let newSchemaDirectory =
			newWorkingDirectory + path.sep + schemaDirectory + path.sep;
		if (!fs.existsSync(newSchemaDirectory)) {
			fs.mkdirSync(newSchemaDirectory);
		}
		this.copyFiles(oldSchemaDirectory, newSchemaDirectory);
		let oldMicroscopeDirectory =
			oldWorkingDirectory + path.sep + microscopeDirectory + path.sep;
		let newMicroscopeDirectory =
			newWorkingDirectory + path.sep + microscopeDirectory + path.sep;
		if (!fs.existsSync(newMicroscopeDirectory)) {
			fs.mkdirSync(newMicroscopeDirectory);
		}
		this.copyFiles(oldMicroscopeDirectory, newMicroscopeDirectory);
		this.setState({ workingDirectory: newWorkingDirectory });
	}

	copyFiles(oldDirectory, newDirectory) {
		readDirAsync(oldDirectory).then(function(fileNames) {
			fileNames.forEach(function(fileName) {
				let oldFile = oldDirectory + fileName;
				let newFile = newDirectory + fileName;
				fs.copyFile(oldFile, newFile, err => {
					if (err) throw err;
					console.log(oldFile + " was copied to " + newFile);
				});
			});
		});
	}

	onLoadSchema(complete) {
		let workingDirectory = this.state.workingDirectory;
		let dirPath = workingDirectory + schemaDirectory + path.sep;
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
					console.log(fileSchema);
					if (fileSchema !== null) {
						if (fileSchema.constructor === Array) {
							schema = schema.concat(fileSchema);
						} else {
							schema.push(fileSchema);
						}
					}
				});
				console.log(schema);
				complete(schema);
			});
	}

	onLoadMicroscopes(complete) {
		let workingDirectory = this.state.workingDirectory;
		let dirPath = workingDirectory + microscopeDirectory + path.sep;
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

	onWorkingDirectorySave(complete, microscope) {
		let workingDirectory = this.state.workingDirectory;
		let dirPath = workingDirectory + microscopeDirectory + path.sep;
		//let dirPath = null;
		// let isTemplate = microscope.isTemplate;
		// if (isTemplate) {
		// 	dirPath = workingDirectory + "templates/";
		// } else {
		// 	dirPath = workingDirectory + "microscopes/";
		// }
		let json = JSON.stringify(microscope);
		let micName = microscope.name;
		let micNameNormalized = micName.replace(/\s+/g, "_").toLowerCase();
		let fileName = dirPath + `${micNameNormalized}.json`;
		fs.writeFile(fileName, json, complete);
	}

	handleSelectWorkingDirectory(filePaths) {
		if (!filePaths) {
			return;
		}
		let filePath = null;
		if (filePaths instanceof Array) {
			if (!filePaths[0]) {
				return;
			}
			filePath = filePaths[0];
		} else {
			filePath = filePaths;
		}
		this.setState({ workingDirectory: filePath });
	}

	handleConfirmWorkingDirectory(value) {
		let newValue = null;
		if (fs.lstatSync(value).isDirectory() && !value.endsWith(path.sep))
			newValue = value + path.sep;
		else newValue = value;
		this.setState({
			workingDirectory: newValue,
			workingDirectoryConfirmed: true
		});
	}

	render() {
		let dims = this.state.windowDimensions;
		let workingDirectory = this.state.workingDirectory;
		let workingDirectoryConfirmed = this.state.workingDirectoryConfirmed;
		if (!workingDirectoryConfirmed) {
			return (
				<MicroscopeMetadataToolWorkingDirectoryChooser
					width={dims.width}
					height={dims.height}
					workingDirectory={workingDirectory}
					handleSelectWorkingDirectory={this.handleSelectWorkingDirectory}
					handleConfirmWorkingDirectory={this.handleConfirmWorkingDirectory}
				/>
			);
		} else {
			return (
				<MicroscopeMetadataTool
					width={dims.width}
					height={dims.height}
					onLoadSchema={this.onLoadSchema}
					onLoadMicroscopes={this.onLoadMicroscopes}
					onSaveMicroscope={this.onWorkingDirectorySave}
					imagesPath={"./../public/assets/"}
				/>
			);
		}
	}
}
