import React from "react";
import ReactDOM from "react-dom";

import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

import MicroscopyMetadataTool from "4dn-microscopy-metadata-tool";

const fs = window.require("fs");
const electron = window.require("electron");
const appPath = electron.remote.app.getAppPath();
const homePath = electron.remote.app.getPath("home");
const path = window.require("path");
const dialog = electron.remote.dialog;
const mainWindow = electron.BrowserWindow;

const toolDirectory = "./MicroscopyMetadataTool/";
const schemaDirectory = "./schemas/";
const microscopeDirectory = "./microscopes/";

window.onload = () => {
	ReactDOM.render(
		<MicroscopyMetadataToolComponent />,
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

class MicroscopyMetadataToolWorkingDirectoryChooser extends React.PureComponent {
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

class MicroscopyMetadataToolComponent extends React.PureComponent {
	static copyFiles(oldDirectory, newDirectory) {
		readDirAsync(oldDirectory).then(function(fileNames) {
			fileNames.forEach(function(fileName) {
				let oldFile = path.resolve(oldDirectory, fileName);
				let newFile = path.resolve(newDirectory, fileName);
				fs.copyFile(oldFile, newFile, err => {
					if (err) throw err;
					//console.log(oldFile + " was copied to " + newFile);
				});
			});
		});
	}

	static cleanDirectory(newSchemaDirectory) {
		readDirAsync(newSchemaDirectory).then(function(fileNames) {
			fileNames.forEach(function(fileName) {
				let oldFile = path.resolve(newSchemaDirectory, fileName);
				fs.unlinkSync(oldFile);
			});
		});
	}

	constructor(props) {
		super(props);
		window.console.log("Application directory:", appPath);
		this.state = {
			workingDirectory: path.resolve(appPath),
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

		const oldWorkingDirectory = this.state.workingDirectory;
		const newWorkingDirectory = path.resolve(homePath, toolDirectory);
		if (!fs.existsSync(newWorkingDirectory)) {
			fs.mkdirSync(newWorkingDirectory);
		}

		const oldSchemaDirectory = path.resolve(
			oldWorkingDirectory,
			schemaDirectory
		);
		const newSchemaDirectory = path.resolve(
			newWorkingDirectory,
			schemaDirectory
		);
		if (!fs.existsSync(newSchemaDirectory)) {
			fs.mkdirSync(newSchemaDirectory);
		}
		MicroscopyMetadataToolComponent.cleanDirectory(newSchemaDirectory);
		MicroscopyMetadataToolComponent.copyFiles(
			oldSchemaDirectory,
			newSchemaDirectory
		);

		const oldMicroscopeDirectory = path.resolve(
			oldWorkingDirectory,
			microscopeDirectory
		);
		const newMicroscopeDirectory = path.resolve(
			newWorkingDirectory,
			microscopeDirectory
		);
		if (!fs.existsSync(newMicroscopeDirectory)) {
			fs.mkdirSync(newMicroscopeDirectory);
		}
		MicroscopyMetadataToolComponent.copyFiles(
			oldMicroscopeDirectory,
			newMicroscopeDirectory
		);
		this.setState({ workingDirectory: newWorkingDirectory });

		window.console.log(
			"workingDirectory -- old, new",
			oldWorkingDirectory,
			newWorkingDirectory
		);
	}

	onLoadSchema(complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, schemaDirectory);
		let schema = [];
		readDirAsync(dirPath)
			.then(function(fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function(fileName) {
					absoluteFileNames.push(path.resolve(dirPath, fileName));
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function(files) {
				files.forEach(function(file) {
					var fileSchema = JSON.parse(file);
					//console.log(fileSchema);
					if (fileSchema !== null) {
						if (fileSchema.constructor === Array) {
							schema = schema.concat(fileSchema);
						} else {
							schema.push(fileSchema);
						}
					}
				});
				//console.log(schema);
				complete(schema);
			});
	}

	onLoadMicroscopes(complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, microscopeDirectory);
		let microscopesDB = {};
		readDirAsync(dirPath)
			.then(function(fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function(fileName) {
					if (fileName.endsWith(".json"))
						absoluteFileNames.push(path.resolve(dirPath, fileName));
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function(files) {
				files.forEach(function(file) {
					var microscope = JSON.parse(file);
					if (microscope !== null)
						microscopesDB[microscope.Name + "_" + microscope.ID] = microscope;
				});
				complete(microscopesDB);
			});
	}

	onWorkingDirectorySave(microscope, complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, microscopeDirectory);
		//let dirPath = null;
		// let isTemplate = microscope.isTemplate;
		// if (isTemplate) {
		// 	dirPath = workingDirectory + "templates/";
		// } else {
		// 	dirPath = workingDirectory + "microscopes/";
		// }
		console.log("microscope:");
		console.log(microscope);

		let json = JSON.stringify(microscope);
		let micName = microscope.Name;
		let micNameNormalized = micName.replace(/\s+/g, "_").toLowerCase();
		//let fileName = dirPath + `${micNameNormalized}.json`;
		let fileName = path.resolve(dirPath, `${micNameNormalized}.json`);
		console.log("dirPath " + dirPath);
		console.log("fileName " + fileName);
		fs.writeFile(fileName, json, function() {
			complete(micNameNormalized);
		});
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
		const {
			windowDimensions: dims,
			workingDirectory,
			workingDirectoryConfirmed
		} = this.state;
		const imagesPath = path.resolve(appPath, "./public/assets/");
		if (!workingDirectoryConfirmed) {
			return (
				<MicroscopyMetadataToolWorkingDirectoryChooser
					width={dims.width}
					height={dims.height}
					workingDirectory={workingDirectory}
					handleSelectWorkingDirectory={this.handleSelectWorkingDirectory}
					handleConfirmWorkingDirectory={this.handleConfirmWorkingDirectory}
				/>
			);
		} else {
			return (
				<MicroscopyMetadataTool
					width={dims.width}
					height={dims.height}
					onLoadSchema={this.onLoadSchema}
					onLoadMicroscopes={this.onLoadMicroscopes}
					onSaveMicroscope={this.onWorkingDirectorySave}
					imagesPath={imagesPath}
				/>
			);
		}
	}
}
