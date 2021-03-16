import React from "react";
import ReactDOM from "react-dom";

import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import MicroscopyMetadataTool from "4dn-microscopy-metadata-tool";

const fs = window.require("fs");
const electron = window.require("electron");
const appPath = electron.remote.app.getAppPath();
const homePath = electron.remote.app.getPath("home");
const path = window.require("path");
const dialog = electron.remote.dialog;
const mainWindow = electron.BrowserWindow;

const toolDirectory = "./MicroscopyMetadataTool/";
const microMetaOptionsFile = "micrometa-options.txt";
const schemaDirectory = "./schemas/";
const dimensionsDirectory = "./dimensions/";
const microscopeDirectory = "./microscopes/";
const settingsDirectory = "./settings/";

window.onload = () => {
	ReactDOM.render(
		<MicroscopyMetadataToolComponent />,
		document.getElementById("root")
	);
};

// make Promise version of fs.readdir()
function readDirAsync(dirname) {
	return new Promise(function (resolve, reject) {
		fs.readdir(dirname, function (err, filenames) {
			if (err) reject(err);
			else resolve(filenames);
		});
	});
}

// make Promise version of fs.readFile()
function readFileAsync(filename) {
	return new Promise(function (resolve, reject) {
		fs.readFile(filename, function (err, data) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}

class MicroscopyMetadataToolWorkingDirectoryChooser extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isPathValid: false,
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
		dialog
			.showOpenDialog(mainWindow, {
				defaultPath: `${value}`,
				properties: ["openDirectory"],
			})
			.then((result) => {
				if (!result.canceled) {
					this.props.handleSelectWorkingDirectory(result.filePaths);
				} else {
					this.props.handleSelectWorkingDirectory(null);
				}
			});
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
			margin: "5px",
		};
		let containerStyle = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: this.props.width,
			height: this.props.height,
			alignItems: "center",
		};
		let inputContainerStyle = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "row",
			flexWrap: "wrap",
			alignItems: "center",
			width: "410px",
			height: "50px",
		};
		let buttonContainerStyle = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "row",
			flexWrap: "wrap",
			alignItems: "center",
		};
		let controlStyle = {
			height: "50px",
		};
		if (!isPathValid) {
			controlStyle = Object.assign(controlStyle, {
				background: "red",
			});
		} else {
			controlStyle = Object.assign(controlStyle, {
				background: "green",
			});
		}
		return (
			<div style={containerStyle}>
				<OverlayTrigger
					placement={"top"}
					delay={{ show: 1000, hide: 1000 }}
					rootClose={true}
					rootCloseEvent={"mousedown" || "click"}
					overlay={
						<Popover id="popover-basic">
							<Popover.Title as="h3">Current working folder</Popover.Title>
							<Popover.Content>
								<p>The path to the current working folder.</p>
							</Popover.Content>
						</Popover>
					}
				>
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
				</OverlayTrigger>
				<div style={buttonContainerStyle}>
					<OverlayTrigger
						placement={"left"}
						delay={{ show: 1000, hide: 1000 }}
						rootClose={true}
						rootCloseEvent={"mousedown" || "click"}
						overlay={
							<Popover id="popover-basic">
								<Popover.Title as="h3">Browse local file-system</Popover.Title>
								<Popover.Content>
									<p>
										Click this button to navigate your file system and select a
										home folder that will contain your saved Microscope files.
										This folder will constitute your local Repository.
									</p>
								</Popover.Content>
							</Popover>
						}
					>
						<Button
							onClick={this.onClickSelectWorkingDirectory}
							style={buttonStyle}
							size="lg"
						>
							Browse
						</Button>
					</OverlayTrigger>
					<OverlayTrigger
						placement={"right"}
						delay={{ show: 1000, hide: 1000 }}
						rootClose={true}
						rootCloseEvent={"mousedown" || "click"}
						overlay={
							<Popover id="popover-basic">
								<Popover.Title as="h3">Continue</Popover.Title>
								<Popover.Content>
									<p>Click Continue to use the current working folder.</p>
								</Popover.Content>
							</Popover>
						}
					>
						<Button
							onClick={this.onClickConfirmWorkingDirectory}
							style={buttonStyle}
							size="lg"
							disabled={!isPathValid}
						>
							Continue
						</Button>
					</OverlayTrigger>
				</div>
			</div>
		);
	}
}

class MicroscopyMetadataToolComponent extends React.PureComponent {
	static copyFiles(oldPath, newPath) {
		readDirAsync(oldPath).then(function (fileNames) {
			fileNames.forEach(function (fileName) {
				let oldFile = path.resolve(oldPath, fileName);
				let newFile = path.resolve(newPath, fileName);
				fs.copyFile(oldFile, newFile, (err) => {
					if (err) throw err;
					//console.log(newFile + " copied");
				});
			});
		});
	}

	static copyFilesSync(oldPath, newPath) {
		let fileNames = fs.readdirSync(oldPath);
		fileNames.forEach(function (fileName) {
			let oldFile = path.resolve(oldPath, fileName);
			let newFile = path.resolve(newPath, fileName);
			try {
				fs.copyFileSync(oldFile, newFile, fs.constants.COPYFILE_EXCL);
			} catch (err) {
				console.log(err);
			}
		});
	}

	static cleanDirectory(pathToClean) {
		fs.readdirSync(pathToClean).forEach(function (file, index) {
			const curPath = path.join(pathToClean, file);
			fs.unlinkSync(curPath);
		});
		// readDirAsync(newSchemaDirectory).then(function (fileNames) {
		// 	fileNames.forEach(function (fileName) {
		// 		let oldFile = path.resolve(newSchemaDirectory, fileName);
		// 		fs.unlinkSync(oldFile);
		// 		//console.log(oldFile + " eliminated");
		// 	});
		// });
	}

	constructor(props) {
		super(props);
		//window.console.log("Application directory:", appPath);
		this.state = {
			workingDirectory: path.resolve(appPath),
			workingDirectoryConfirmed: false,
			windowDimensions: {
				width: window && window.innerWidth,
				height: window && window.innerHeight,
			},
		};
		this.onLoadSchema = this.onLoadSchema.bind(this);
		this.onLoadMicroscopes = this.onLoadMicroscopes.bind(this);
		this.onLoadDimensions = this.onLoadDimensions.bind(this);
		this.onLoadSettings = this.onLoadSettings.bind(this);
		this.onWorkingDirectorySave = this.onWorkingDirectorySave.bind(this);
		this.onWorkingDirectorySettingsSave = this.onWorkingDirectorySettingsSave.bind(
			this
		);

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
			height: window.innerHeight,
		};
		this.setState({ windowDimensions });
	}

	componentDidMount() {
		window.addEventListener("resize", this.onWindowResize);
		if (!this.state.windowDimensions.width) {
			this.onWindowResize();
		}

		//const oldWorkingDirectory = this.state.workingDirectory;
		const newWorkingDirectory = path.resolve(homePath, toolDirectory);
		let optionsWorkingDirectory = null;
		if (!fs.existsSync(newWorkingDirectory)) {
			fs.mkdirSync(newWorkingDirectory);
			optionsWorkingDirectory = newWorkingDirectory;
		} else {
			const mmaOptionsFile = path.resolve(
				newWorkingDirectory,
				microMetaOptionsFile
			);
			if (!fs.existsSync(mmaOptionsFile)) {
				optionsWorkingDirectory = newWorkingDirectory;
			} else {
				let data = fs.readFileSync(mmaOptionsFile);
				var options = JSON.parse(data);
				let workingDirectory = options.WorkingDirectory;
				optionsWorkingDirectory = workingDirectory;
			}
		}

		//console.log("optionsWorkingDirectory");
		//console.log(optionsWorkingDirectory);

		this.setState({ workingDirectory: optionsWorkingDirectory });
	}

	onLoadSchema(complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, schemaDirectory);
		let schema = [];
		readDirAsync(dirPath)
			.then(function (fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function (fileName) {
					absoluteFileNames.push(path.resolve(dirPath, fileName));
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function (files) {
				files.forEach(function (file) {
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

	onLoadDimensions(complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, dimensionsDirectory);
		let dimensions = {};
		readDirAsync(dirPath)
			.then(function (fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function (fileName) {
					absoluteFileNames.push(path.resolve(dirPath, fileName));
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function (files) {
				files.forEach(function (file) {
					var fileSchema = JSON.parse(file);
					//console.log(fileSchema);
					if (fileSchema !== null) {
						dimensions = Object.assign(dimensions, fileSchema);
					}
				});
				//console.log(schema);
				complete(dimensions);
			});
	}

	onLoadMicroscopes(complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, microscopeDirectory);
		let microscopesDB = {};
		readDirAsync(dirPath)
			.then(function (fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function (fileName) {
					if (fileName.endsWith(".json"))
						absoluteFileNames.push(path.resolve(dirPath, fileName));
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function (files) {
				files.forEach(function (file) {
					var microscope = JSON.parse(file);
					if (microscope !== null)
						microscopesDB[microscope.Name + "_" + microscope.ID] = microscope;
				});
				complete(microscopesDB);
			});
	}

	onLoadSettings(complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, settingsDirectory);
		let settingsDB = {};
		readDirAsync(dirPath)
			.then(function (fileNames) {
				let absoluteFileNames = [];
				fileNames.forEach(function (fileName) {
					if (fileName.endsWith(".json"))
						absoluteFileNames.push(path.resolve(dirPath, fileName));
				});
				return Promise.all(absoluteFileNames.map(readFileAsync));
			})
			.then(function (files) {
				files.forEach(function (file) {
					var setting = JSON.parse(file);
					if (setting !== null)
						settingsDB[setting.Name + "_" + setting.ID] = setting;
				});
				complete(settingsDB);
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
		// console.log("microscope:");
		// console.log(microscope);

		let json = JSON.stringify(microscope);
		let micName = microscope.Name;
		let micNameNormalized = micName.replace(/\s+/g, "_").toLowerCase();
		//let fileName = dirPath + `${micNameNormalized}.json`;
		let fileName = path.resolve(dirPath, `${micNameNormalized}.json`);
		// console.log("dirPath " + dirPath);
		// console.log("fileName " + fileName);
		fs.writeFile(fileName, json, function () {
			complete(micNameNormalized);
		});
	}

	onWorkingDirectorySettingsSave(settings, complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, settingsDirectory);
		//let dirPath = null;
		// let isTemplate = microscope.isTemplate;
		// if (isTemplate) {
		// 	dirPath = workingDirectory + "templates/";
		// } else {
		// 	dirPath = workingDirectory + "microscopes/";
		// }
		// console.log("microscope:");
		// console.log(microscope);

		let json = JSON.stringify(settings);
		let settingsName = settings.Name;
		let settingsNameNormalized = settingsName
			.replace(/\s+/g, "_")
			.toLowerCase();
		//let fileName = dirPath + `${micNameNormalized}.json`;
		let fileName = path.resolve(dirPath, `${settingsNameNormalized}.json`);
		// console.log("dirPath " + dirPath);
		// console.log("fileName " + fileName);
		fs.writeFile(fileName, json, function () {
			complete(settingsNameNormalized);
		});
	}

	handleSelectWorkingDirectory(filePaths) {
		//console.log("filePaths");
		//console.log(filePaths);
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
		//console.log("filePath");
		//console.log(filePath);
		this.setState({ workingDirectory: filePath });
	}

	handleConfirmWorkingDirectory(value) {
		let newValue = null;
		if (fs.lstatSync(value).isDirectory() && !value.endsWith(path.sep))
			newValue = value + path.sep;
		else newValue = value;

		let oldWorkingDirectory = path.resolve(appPath);
		const newWorkingDirectory = path.resolve(newValue);

		const oldSchemaDirectory = path.resolve(
			oldWorkingDirectory,
			schemaDirectory
		);
		const oldDimensionsDirectory = path.resolve(
			oldWorkingDirectory,
			dimensionsDirectory
		);
		const newSchemaDirectory = path.resolve(
			newWorkingDirectory,
			schemaDirectory
		);
		const newDimensionsDirectory = path.resolve(
			newWorkingDirectory,
			dimensionsDirectory
		);
		if (!fs.existsSync(newSchemaDirectory)) {
			fs.mkdirSync(newSchemaDirectory);
		}
		if (!fs.existsSync(newDimensionsDirectory)) {
			fs.mkdirSync(newDimensionsDirectory);
		}
		console.log("CleaningFiles from " + newSchemaDirectory);
		MicroscopyMetadataToolComponent.cleanDirectory(newSchemaDirectory);
		console.log("CleaningFiles from " + newDimensionsDirectory);
		MicroscopyMetadataToolComponent.cleanDirectory(newDimensionsDirectory);

		if (fs.existsSync(oldSchemaDirectory)) {
			console.log("CopyFiles from " + oldSchemaDirectory);
			MicroscopyMetadataToolComponent.copyFilesSync(
				oldSchemaDirectory,
				newSchemaDirectory
			);
		}

		if (fs.existsSync(oldDimensionsDirectory)) {
			console.log("CopyFiles from " + oldDimensionsDirectory);
			MicroscopyMetadataToolComponent.copyFilesSync(
				oldDimensionsDirectory,
				newDimensionsDirectory
			);
		}

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
		if (fs.existsSync(oldMicroscopeDirectory)) {
			console.log("CopyFiles from " + oldMicroscopeDirectory);
			MicroscopyMetadataToolComponent.copyFilesSync(
				oldMicroscopeDirectory,
				newMicroscopeDirectory
			);
		}

		const oldSettingsDirectory = path.resolve(
			oldWorkingDirectory,
			settingsDirectory
		);
		const newSettingsDirectory = path.resolve(
			newWorkingDirectory,
			settingsDirectory
		);
		if (!fs.existsSync(newSettingsDirectory)) {
			fs.mkdirSync(newSettingsDirectory);
		}
		if (fs.existsSync(oldSettingsDirectory)) {
			console.log("CopyFiles from " + oldSettingsDirectory);
			MicroscopyMetadataToolComponent.copyFilesSync(
				oldSettingsDirectory,
				newSettingsDirectory
			);
		}

		const toolWorkingDirectory = path.resolve(homePath, toolDirectory);
		const mmaOptionsFile = path.resolve(
			toolWorkingDirectory,
			microMetaOptionsFile
		);
		let obj = {};
		obj.WorkingDirectory = newWorkingDirectory;

		let json = JSON.stringify(obj);
		fs.writeFileSync(mmaOptionsFile, json);

		this.setState({
			workingDirectory: newValue,
			workingDirectoryConfirmed: true,
		});
	}

	render() {
		const {
			windowDimensions: dims,
			workingDirectory,
			workingDirectoryConfirmed,
		} = this.state;
		const imagesPathPNG =
			path.resolve(appPath, "./public/assets/png") + path.sep;
		const imagesPathSVG =
			path.resolve(appPath, "./public/assets/svg") + path.sep;
		//const imagesPath = path.resolve(appPath, "./public/assets/svg");
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
					onLoadDimensions={this.onLoadDimensions}
					onLoadMicroscopes={this.onLoadMicroscopes}
					onLoadSettings={this.onLoadSettings}
					onSaveMicroscope={this.onWorkingDirectorySave}
					onSaveSetting={this.onWorkingDirectorySettingsSave}
					imagesPathPNG={imagesPathPNG}
					imagesPathSVG={imagesPathSVG}
				/>
			);
		}
	}
}
