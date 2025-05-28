import React from "react";
import ReactDOM from "react-dom";

import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import MicroMetaAppReact from "micro-meta-app-react";
import MicroMetaExplorer from "micro-meta-explorer";

import ModeSelector from "./modeSelector";

import {
	string_logo_img_micro_bk,
	number_logo_width,
	number_logo_height,
} from "micro-meta-app-react/es/constants";

import { footnote } from "./constants";

import { isDefined } from "micro-meta-app-react/es/genericUtilities";

const url = require("url");

const remote = require("@electron/remote");

const { execSync, spawnSync } = window.require("child_process");
const fs = window.require("fs");
const electron = window.require("electron");
const BrowserWindow = remote.BrowserWindow;

const appPath = remote.app.getAppPath();
const homePath = remote.app.getPath("home");
const path = window.require("path");
const dialog = remote.dialog;

const mainWindow = BrowserWindow;

const toolDirectory = "./MicroMetaApp/";
const microMetaOptionsFile = "micrometa-options.txt";
const schemaDirectory = "./schemas/";
const dimensionsDirectory = "./dimensions/";
const microscopeDirectory = "./microscopes/";
const componentDirectory = "./components/";
const settingsDirectory = "./settings/";
const tiersDirectory = "./tiers/";
const scriptDirectory = "./scripts/";
const scriptDependencyDirectory = "./scripts/dependency-jars";

const imageMetadataReaderScriptName = "4DNMicroscopyMetadataReader-1.0.1.jar";

const IS_DEBUG = true;

window.onload = () => {
	ReactDOM.render(
		<MicroMetaAppElectronComponent isDebug={IS_DEBUG} />,
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

class MicroMetaAppElectronWorkingDirectoryChooser extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isPathValid: false,
		};
		this.onClickSelectWorkingDirectory =
			this.onClickSelectWorkingDirectory.bind(this);
		this.onClickConfirmWorkingDirectory =
			this.onClickConfirmWorkingDirectory.bind(this);
		this.handleWorkingDirectoryChange =
			this.handleWorkingDirectoryChange.bind(this);

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
				buttonLabel: "Select",
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
		let wrapperContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: this.props.width,
			height: this.props.height,
			alignItems: "center",
		};
		const mainContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: "100%",
			height: "100%",
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
		const folderSelectorContainer = {
			display: "flex",
			justifyContent: "flex-start",
			flexFlow: "column",
			width: "100%",
			//height: `${number_logo_height}px`,
			height: "60%",
			alignItems: "center",
		};
		const logoContainer = {
			display: "flex",
			justifyContent: "flex-end",
			flexFlow: "column",
			width: "100%",
			//height: `${number_logo_height}px`,
			height: "40%",
			alignItems: "center",
		};
		let styleImage = {
			width: "100%",
			height: "100%",
			margin: "auto",
		};

		let styleImageContainer = {
			width: `${number_logo_width}px`,
			height: `${number_logo_height}px`,
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

		let logoImg = url.resolve(
			this.props.imagesPathPNG,
			string_logo_img_micro_bk
		);
		let logoPath =
			logoImg +
			(logoImg.indexOf("githubusercontent.com") > -1 ? "?sanitize=true" : "");
		let titleText = "Select your local Micro-Meta App home folder";

		return (
			<div style={wrapperContainer}>
				<div style={mainContainer}>
					<div style={logoContainer}>
						<div style={styleImageContainer}>
							<img src={logoPath} alt={logoImg} style={styleImage} />
						</div>
					</div>
					<div style={folderSelectorContainer}>
						<div style={{ textAlign: "center", fontWeight: "bold" }}>
							{titleText}
						</div>
						<OverlayTrigger
							placement={"top"}
							delay={{ show: 1000, hide: 1000 }}
							rootClose={true}
							rootCloseEvent={"mousedown" || "click"}
							overlay={
								<Popover id="popover-basic">
									<Popover.Title as="h3">
										Select your local Micro-Meta App home folder
									</Popover.Title>
									<Popover.Content>
										<p>
											Select the folder on your local computer that you want to
											use as the Micro-Meta App home folder, in which to store
											Microscope.JSON and SettingsJSON files.
										</p>
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
										<Popover.Title as="h3">
											Browse local file-system
										</Popover.Title>
										<Popover.Content>
											<p>
												Click this button to navigate your file system and
												select a home folder that will contain your saved
												Microscope files. This folder will constitute your local
												Repository.
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
					{footnote}
				</div>
			</div>
		);
	}
}

class MicroMetaAppElectronComponent extends React.PureComponent {
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
			if (!fs.lstatSync(oldFile).isDirectory()) {
				try {
					fs.copyFileSync(oldFile, newFile, fs.constants.COPYFILE_EXCL);
				} catch (err) {
					console.log(err);
				}
			}
		});
	}

	static cleanDirectory(pathToClean) {
		fs.readdirSync(pathToClean).forEach(function (file, index) {
			const curPath = path.join(pathToClean, file);
			if (!fs.lstatSync(curPath).isDirectory()) fs.unlinkSync(curPath);
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
		this.state = {
			workingDirectory: path.resolve(appPath),
			workingDirectoryConfirmed: false,
			windowDimensions: {
				width: window && window.innerWidth,
				height: window && window.innerHeight,
			},
			isModeSelected: false,
			useMicroMetaExplorer: null,
			mmeMicroscope: null,
		};
		this.knownComponentTypes = new Set([
			"MicroscopyAccessory",
			"Software",
			"Transmitted_Lightsource", 
			"Fluorescence_Lightsource", 
			"Magnification", 
			"FluorescenceLightPath", 
			"Stage", 
			"Focusing", 
			"OpticalAssembly", 
			"OpticsHolder", 
			"Aperture", 
			"Filter", 
			"MirroringDevice", 
			"Lens", 
			"AdditionalOptics", 
			"Detector", 
			"Camera", 
			"PointDetector",
		]);
		this.onLoadSchema = this.onLoadSchema.bind(this);
		this.onLoadMicroscopes = this.onLoadMicroscopes.bind(this);
		this.loadComponentsFromBaseDir = this.loadComponentsFromBaseDir.bind(this);
		this.onLoadComponents = this.onLoadComponents.bind(this);
		this.onLoadDimensions = this.onLoadDimensions.bind(this);
		this.onLoadSettings = this.onLoadSettings.bind(this);
		this.onLoadTierList = this.onLoadTierList.bind(this);

		this.onLoadMetadata = this.onLoadMetadata.bind(this);

		this.onClickHome = this.onClickHome.bind(this);
		this.onClickOpen = this.onClickOpen.bind(this);

		this.onClickMMA = this.onClickMMA.bind(this);
		this.onClickMME = this.onClickMME.bind(this);

		this.saveAllComponents = this.saveAllComponents.bind(this);
		this.onWorkingDirectorySave = this.onWorkingDirectorySave.bind(this);
		this.onWorkingDirectorySaveComponent = this.onWorkingDirectorySaveComponent.bind(this);
		this.onLoadComponent = this.onLoadComponent.bind(this);
		this.onWorkingDirectorySettingsSave =
			this.onWorkingDirectorySettingsSave.bind(this);

		this.handleSelectWorkingDirectory =
			this.handleSelectWorkingDirectory.bind(this);
		this.handleConfirmWorkingDirectory =
			this.handleConfirmWorkingDirectory.bind(this);

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

		this.setState({ workingDirectory: optionsWorkingDirectory });
	}

	onLoadSchema(complete, resolve) {
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
					if (fileSchema !== null) {
						if (fileSchema.constructor === Array) {
							schema = schema.concat(fileSchema);
						} else {
							schema.push(fileSchema);
						}
					}
				});
				complete(schema, resolve);
			});
	}

	onLoadDimensions(complete, resolve) {
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
					if (fileSchema !== null) {
						dimensions = Object.assign(dimensions, fileSchema);
					}
				});
				complete(dimensions, resolve);
			});
	}

	onLoadMicroscopes(complete, resolve) {
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
					try {
						var microscope = JSON.parse(file);
						if (microscope !== null) {
							microscopesDB[microscope.Name + "_" + microscope.ID] = {};
							microscopesDB[microscope.Name + "_" + microscope.ID].microscope =
								microscope;
						}
					} catch (exception) {
						console.log("Could not parse " + file);
					}
				});
				complete(microscopesDB, resolve);
			});
	}

	loadComponentsFromBaseDir(componentsBaseDir, componentsTree) {
		function isDirectory(source) {
			return fs.lstatSync(source).isDirectory();
		  }
		return readDirAsync(componentsBaseDir)
			.then((subdirs) => {
				const typeFolders = subdirs
					.map((name) => path.join(componentsBaseDir, name))
					.filter(isDirectory);
	
				const typePromises = typeFolders.map((typeFolderPath) => {
					const typeName = path.basename(typeFolderPath);
	
					return readDirAsync(typeFolderPath).then((fileNames) => {
						const jsonFiles = fileNames
							.filter((fileName) => fileName.endsWith(".json"))
							.map((fileName) => path.resolve(typeFolderPath, fileName));
	
						return Promise.all(jsonFiles.map(readFileAsync)).then((files) => {
							files.forEach((file) => {
								try {
									const component = JSON.parse(file);
									if (component) {
										const manufacturer = component.Manufacturer || "Unknown Manufacturer";
										const model = component.Model || "Unknown Model";
										const entryKey = component.Name;
	
										// Initialize type level
										if (!componentsTree[typeName]) {
											componentsTree[typeName] = {};
										}
	
										// Initialize manufacturer level
										if (!componentsTree[typeName][manufacturer]) {
											componentsTree[typeName][manufacturer] = {};
										}
	
										// Initialize model level
										if (!componentsTree[typeName][manufacturer][model]) {
											componentsTree[typeName][manufacturer][model] = {};
										}
	
										// Add the component
										componentsTree[typeName][manufacturer][model][entryKey] = {
											component
										};
									}
								} catch (err) {
									console.warn(`Could not parse component file in ${typeName}:`, err);
								}
							});
						});
					});
				});
	
				return Promise.all(typePromises);
			});
	}

	onLoadComponents(complete, resolve) {
		const workingDirectory = this.state.workingDirectory;
		const templateDir = path.resolve(workingDirectory, "components_template");
	
		let componentsTree = {
			loadedComponents: {}
		};
	
		function sortTreeAlphabetically(obj) {
			if (typeof obj !== 'object' || obj === null) return obj;
	
			const sorted = {};
			Object.keys(obj)
				.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
				.forEach((key) => {
					sorted[key] = sortTreeAlphabetically(obj[key]);
				});
			return sorted;
		}
	
		// Only load from components_template directory
		(fs.existsSync(templateDir)
			? this.loadComponentsFromBaseDir(templateDir, componentsTree.loadedComponents)
			: Promise.resolve()
		)
		.then(() => {
			componentsTree.loadedComponents = sortTreeAlphabetically(componentsTree.loadedComponents);
			complete(componentsTree, resolve);
		})
		.catch((err) => {
			console.error("Error loading components:", err);
		});
	}

	onLoadSettings(complete, resolve) {
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
					if (setting !== null) {
						settingsDB[setting.Name + "_" + setting.ID] = {};
						settingsDB[setting.Name + "_" + setting.ID].setting = setting;
					}
				});
				complete(settingsDB, resolve);
			});
	}

	onLoadTierList(complete, resolve) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, tiersDirectory);
		let tiers = {};
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
					var loadedTiers = JSON.parse(file);
					if (loadedTiers !== null) tiers = loadedTiers;
				});
				complete(tiers, resolve);
			});
	}

	onLoadMetadata(imgPath, complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, scriptDirectory);
		let imageMetadataReaderScript = path.resolve(
			dirPath,
			imageMetadataReaderScriptName
		);
		if (!fs.existsSync(imgPath)) {
			//console.log("Error : " + `${imgPath} does not exists`);
			complete({ Error: `${imgPath} does not exists` });
			return;
		}
		let checkVersionCmd = "java";
		let checkVersionCmdArgs = ["-version"];
		try {
			const checkVersionResults = spawnSync(
				checkVersionCmd,
				checkVersionCmdArgs
			);
			var checkVersionResultsString = new TextDecoder().decode(
				checkVersionResults.stderr
			);

			let javaVersion = checkVersionResultsString.split("\n")[0];
			javaVersion = javaVersion.replace("b'", "");
			javaVersion = javaVersion.replace("\\n'", "");
			if (javaVersion.startsWith("java version")) {
				javaVersion = javaVersion.replace('java version "', "");
				javaVersion = javaVersion.replace('"', "");
				let javaVersionSplit = javaVersion.split(".");
				let javaVersionMain = Number(javaVersionSplit[0]);
				let javaVersionSub = Number(javaVersionSplit[1]);
				if (
					javaVersionMain < 1 ||
					(javaVersionMain === 1 && javaVersionSub < 8)
				) {
					complete({
						Error:
							"This software require at least java version 1.8, you are currently running java version " +
							javaVersion +
							". Update your java version or skip the image loading process.",
					});
					return;
				} else if (javaVersionMain > 1 && javaVersionMain < 8) {
					complete({
						Error:
							"This software require at least java version 1.8, you are currently running java version " +
							javaVersion +
							". Update your java version or skip the image loading process.",
					});
					return;
				}
			} else if (javaVersion.startsWith("openjdk version")) {
				javaVersion = javaVersion.replace('openjdk version "', "");
				javaVersion = javaVersion.split('"')[0];
				let javaVersionSplit = javaVersion.split(".");
				let javaVersionMain = Number(javaVersionSplit[0]);
				let javaVersionSub = Number(javaVersionSplit[1]);
				if (
					javaVersionMain < 1 ||
					(javaVersionMain === 1 && javaVersionSub < 8)
				) {
					complete({
						Error:
							"This software require at least openjdk version 8, you are currently running openjdk version " +
							javaVersion +
							". Update your openjdk version or skip the image loading process.",
					});
					return;
				} else if (javaVersionMain > 1 && javaVersionMain < 8) {
					complete({
						Error:
							"This software require at least openjdk version 8, you are currently running openjdk version " +
							javaVersion +
							". Update your openjdk version or skip the image loading process.",
					});
					return;
				}
			} else {
				complete({
					Error: "Unable to parse java version " + javaVersion + ".",
				});
				return;
			}
		} catch (exception) {
			complete({
				Error: "Could not verify the java version installed on your system",
			});
			return;
		}

		let cmd =
			"java -jar " +
			'"' +
			imageMetadataReaderScript +
			'"' +
			" " +
			'"' +
			imgPath +
			'"';
		try {
			const metadata = execSync(cmd);
			console.log(metadata);
			var metadataString = new TextDecoder().decode(metadata);
			if (metadataString.startsWith("ERROR:")) {
				//console.log("Error : " + `Could not read ${imgPath} metadata`);
				console.log("ERROR:");
				console.log(metadataString.replace("ERROR:", ""));
				complete({ Error: `Could not read ${imgPath} metadata` });
				return;
			}
			let metadataJSON = JSON.parse(metadataString);
			console.log("onLoadMetadata");
			console.log(metadataJSON);
			complete(metadataJSON);
		} catch (exception) {
			console.log("error - " + exception.name + " - " + exception.message);
			console.log("stack:");
			console.log(exception.message);
			console.log(exception.stack);
			complete({ Error: "Something went wrong trying to read the metadata" });
		}
	}

	onWorkingDirectorySave(microscope, complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, microscopeDirectory);
		let json = JSON.stringify(microscope);
		let micName = microscope.Name;
		let micNameNormalized = micName.replace(/\s+/g, "_").toLowerCase();
		let fileName = path.resolve(dirPath, `${micNameNormalized}.json`);
		fs.writeFile(fileName, json, function () {
			complete(micNameNormalized);
		});
	}

	// saveAllComponents(elementData, complete, validationTier) {
	// 	const elementDataCopy = JSON.parse(JSON.stringify(elementData));
	// 	let saveCount = 0;
	// 	const keys = Object.keys(elementDataCopy);
	// 	let duplicateFound = false;

	// 	const onSaveComplete = (componentName, error) => {
	// 		saveCount++;
	// 		if (error) {
	// 			duplicateFound = true;
	// 		}
	// 		if (saveCount === keys.length) {
	// 			if (duplicateFound) {
	// 				complete("At least one component file name already exists. Not all components were.");
	// 			} else {
	// 				complete(null);
	// 			}
	// 		}
	// 	};
	
	// 	keys.forEach((key) => {
	// 		const component = elementDataCopy[key];
	// 		this.onWorkingDirectorySaveComponent(component, onSaveComplete, validationTier, true);
	// 	});
	// }

	saveAllComponents(elementData, complete, validationTier) {
		const elementDataCopy = JSON.parse(JSON.stringify(elementData));
		let saveCount = 0;
		const keys = Object.keys(elementDataCopy);
		let duplicateFiles = [];
	
		const onSaveComplete = (componentName, error) => {
			saveCount++;
			if (error && componentName) {
				duplicateFiles.push(componentName);
			}
			if (saveCount === keys.length) {
				if (duplicateFiles.length > 0) {
					const msg = `Components saved but the following component file names already exist and were not saved:\n\n${duplicateFiles.join('\n')}`;
					complete(msg);
				} else {
					complete(null);
				}
			}
		};
	
		keys.forEach((key) => {
			const component = elementDataCopy[key];
			this.onWorkingDirectorySaveComponent(component, onSaveComplete, validationTier);
		});
	}

	onWorkingDirectorySaveComponent(component, complete, validationTier) {
		const workingDirectory = this.state.workingDirectory;
		const componentCopy = JSON.parse(JSON.stringify(component));
		const { Schema_ID } = componentCopy;
		const componentTypeName = Schema_ID ? Schema_ID.split('.')[0] : "unknown";
	
		const componentTypeDir = path.resolve(workingDirectory, "components_template", componentTypeName);
	
		if (!fs.existsSync(componentTypeDir)) {
			fs.mkdirSync(componentTypeDir, { recursive: true });
		}
	
		// Remove unwanted fields
		const {
			ID,
			Category,
			Domain,
			Extension,
			Height,
			ModelVersion,
			OccupiedSpot,
			OffsetX,
			OffsetY,
			PositionX,
			PositionY,
			PositionZ,
			Rotate,
			Width,
			Schema_ID: _,
			...consolidatedData
		} = componentCopy;
	
		const { Manufacturer, Model, CatalogNumber } = consolidatedData;
		const validation = validationTier ? `_${validationTier}` : "";
		const newName = `${componentTypeName}_${Manufacturer}_${Model}_${CatalogNumber}${validation}`
			.replace(/\s+/g, "_")
			.toLowerCase();
		consolidatedData.Name = newName;
	
		let json = JSON.stringify(consolidatedData, null, 2);
		let fileName = path.resolve(componentTypeDir, `${newName}.json`);
	
		if (fs.existsSync(fileName)) {
			complete(path.basename(fileName), `Cannot save component: file ${path.basename(fileName)} already exists.`);
		} else {
			fs.writeFile(fileName, json, function () {
				complete(newName, null);
			});
		}
	}
	

	onLoadComponent(complete, resolve) {
		dialog.showOpenDialog({
			properties: ['openFile'],   
			filters: [{ name: 'JSON Files', extensions: ['json'] }], 
		})
		.then(result => {
			if (result.canceled) {
				return; 
			}
	
			const filePath = result.filePaths[0];
	
			readFileAsync(filePath)
				.then(file => {
					try {
						let component = JSON.parse(file);
						let componentsDB = {};

						if (component !== null) {
							let componentKey = `${component.Name}_${component.ID}`;
							componentsDB[componentKey] = { component };
						}
	
						complete(componentsDB, resolve);
					} catch (exception) {
						console.log("Could not parse:", filePath);
					}
				})
				.catch(error => {
					console.log("Error reading the file:", error);
				});
		})
		.catch(err => {
			console.log('Failed to open file dialog:', err);
		});
	}

	onWorkingDirectorySettingsSave(settings, complete) {
		const workingDirectory = this.state.workingDirectory;
		const dirPath = path.resolve(workingDirectory, settingsDirectory);

		let json = JSON.stringify(settings);
		let settingsName = settings.Name;
		let settingsNameNormalized = settingsName
			.replace(/\s+/g, "_")
			.toLowerCase();
		let fileName = path.resolve(dirPath, `${settingsNameNormalized}.json`);
		fs.writeFile(fileName, json, function () {
			complete(settingsNameNormalized);
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
		const oldScriptsDirectory = path.resolve(
			oldWorkingDirectory,
			scriptDirectory
		);
		const oldScriptsDependencyDirectory = path.resolve(
			oldWorkingDirectory,
			scriptDependencyDirectory
		);
		const oldTiersDirectory = path.resolve(oldWorkingDirectory, tiersDirectory);

		const newSchemaDirectory = path.resolve(
			newWorkingDirectory,
			schemaDirectory
		);
		const newDimensionsDirectory = path.resolve(
			newWorkingDirectory,
			dimensionsDirectory
		);
		const newScriptsDirectory = path.resolve(
			newWorkingDirectory,
			scriptDirectory
		);
		const newScriptsDependencyDirectory = path.resolve(
			newWorkingDirectory,
			scriptDependencyDirectory
		);
		const newTiersDirectory = path.resolve(newWorkingDirectory, tiersDirectory);
		if (!fs.existsSync(newSchemaDirectory)) {
			fs.mkdirSync(newSchemaDirectory);
		}
		if (!fs.existsSync(newDimensionsDirectory)) {
			fs.mkdirSync(newDimensionsDirectory);
		}
		if (!fs.existsSync(newScriptsDirectory)) {
			fs.mkdirSync(newScriptsDirectory);
		}
		if (!fs.existsSync(newScriptsDependencyDirectory)) {
			fs.mkdirSync(newScriptsDependencyDirectory);
		}
		if (!fs.existsSync(newTiersDirectory)) {
			fs.mkdirSync(newTiersDirectory);
		}
		console.log("CleaningFiles from " + newSchemaDirectory);
		MicroMetaAppElectronComponent.cleanDirectory(newSchemaDirectory);
		console.log("CleaningFiles from " + newDimensionsDirectory);
		MicroMetaAppElectronComponent.cleanDirectory(newDimensionsDirectory);
		console.log("CleaningFiles from " + newScriptsDirectory);
		MicroMetaAppElectronComponent.cleanDirectory(newScriptsDirectory);
		console.log("CleaningFiles from " + newScriptsDependencyDirectory);
		MicroMetaAppElectronComponent.cleanDirectory(newScriptsDependencyDirectory);
		console.log("CleaningFiles from " + newScriptsDependencyDirectory);
		MicroMetaAppElectronComponent.cleanDirectory(newScriptsDependencyDirectory);
		console.log("CleaningFiles from " + newTiersDirectory);
		MicroMetaAppElectronComponent.cleanDirectory(newTiersDirectory);

		if (fs.existsSync(oldSchemaDirectory)) {
			console.log("CopyFiles from " + oldSchemaDirectory);
			MicroMetaAppElectronComponent.copyFilesSync(
				oldSchemaDirectory,
				newSchemaDirectory
			);
		}

		if (fs.existsSync(oldDimensionsDirectory)) {
			console.log("CopyFiles from " + oldDimensionsDirectory);
			MicroMetaAppElectronComponent.copyFilesSync(
				oldDimensionsDirectory,
				newDimensionsDirectory
			);
		}

		if (fs.existsSync(oldScriptsDirectory)) {
			console.log("CopyFiles from " + oldScriptsDirectory);
			MicroMetaAppElectronComponent.copyFilesSync(
				oldScriptsDirectory,
				newScriptsDirectory
			);
		}
		if (fs.existsSync(oldScriptsDependencyDirectory)) {
			console.log("CopyFiles from " + oldScriptsDependencyDirectory);
			MicroMetaAppElectronComponent.copyFilesSync(
				oldScriptsDependencyDirectory,
				newScriptsDependencyDirectory
			);
		}

		if (fs.existsSync(oldTiersDirectory)) {
			console.log("CopyFiles from " + oldTiersDirectory);
			MicroMetaAppElectronComponent.copyFilesSync(
				oldTiersDirectory,
				newTiersDirectory
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
			MicroMetaAppElectronComponent.copyFilesSync(
				oldMicroscopeDirectory,
				newMicroscopeDirectory
			);
		}

		const oldComponentTemplateDirectory = path.resolve(
			oldWorkingDirectory,
			"components_template"
		);
		const newComponentTemplateDirectory = path.resolve(
			newWorkingDirectory,
			"components_template"
		);

		if (!fs.existsSync(newComponentTemplateDirectory)) {
			fs.mkdirSync(newComponentTemplateDirectory);
		}
		if (fs.existsSync(oldComponentTemplateDirectory)) {
			console.log("CopyFiles from " + oldComponentTemplateDirectory);
			MicroMetaAppElectronComponent.copyFilesSync(oldComponentTemplateDirectory, newComponentTemplateDirectory);
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
			MicroMetaAppElectronComponent.copyFilesSync(
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

	onClickOpen(microscope) {
		this.setState({
			isModeSelected: true,
			useMicroMetaExplorer: false,
			mmeMicroscope: microscope,
		});
	}

	onClickHome() {
		if (this.props.isDebug) console.log("onClickHome");
		this.setState({
			isModeSelected: false,
			useMicroMetaExplorer: null,
			mmeMicroscope: null,
		});
	}

	onClickMME() {
		this.setState({ isModeSelected: true, useMicroMetaExplorer: true });
	}

	onClickMMA() {
		this.setState({ isModeSelected: true, useMicroMetaExplorer: false });
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
		//let imageLoaded = this.state.imageLoaded;
		//const imagesPath = path.resolve(appPath, "./public/assets/svg");
		// if (!imageLoaded) {
		// 	let dir = "C:/Users/Alex/MicroscopyMetadataTool";
		// 	let imgName = "BPAE cells 40X RGB_LacosteAuthor.czi";
		// 	let imgPath = path.resolve(dir, imgName);
		// 	this.onLoadMetadata(imgPath);
		// } else
		if (!workingDirectoryConfirmed) {
			return (
				<MicroMetaAppElectronWorkingDirectoryChooser
					width={dims.width}
					height={dims.height}
					workingDirectory={workingDirectory}
					handleSelectWorkingDirectory={this.handleSelectWorkingDirectory}
					handleConfirmWorkingDirectory={this.handleConfirmWorkingDirectory}
					imagesPathPNG={imagesPathPNG}
					isDebug={this.props.isDebug}
				/>
			);
		}

		let wrapperContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: dims.width,
			height: dims.height,
			alignItems: "center",
		};

		console.log("isModeSelected");
		console.log(this.state.isModeSelected);
		console.log("useMicroMetaExplorer");
		console.log(this.state.useMicroMetaExplorer);
		console.log("mmeMicroscope");
		console.log(this.state.mmeMicroscope);

		if (!this.state.isModeSelected) {
			return (
				<div style={wrapperContainer}>
					<ModeSelector
						imagesPathPNG={imagesPathPNG}
						imagesPathSVG={imagesPathSVG}
						// onClickLoadSchema={this.handleLoadSchema}
						// onClickLoadDimensions={this.handleLoadDimensions}
						// onClickLoadMicroscopes={this.handleLoadMicroscopes}
						// onClickLoadSettings={this.handleLoadSettings}
						// onClickLoadTierList={this.handleLoadTierList}
						// onClickHandleMicPreset={this.handleMicPreset}
						onClickMME={this.onClickMME}
						onClickMMA={this.onClickMMA}
						// is4DNPortal={this.state.is4DNPortal}
						hasExplorer={true}
						isDebug={this.props.isDebug}
					/>
				</div>
			);
		} else {
			if (this.state.useMicroMetaExplorer) {
				return (
					<div style={wrapperContainer}>
						<MicroMetaExplorer
							width={dims.width}
							height={dims.height}
							onLoadSchema={this.onLoadSchema}
							onLoadMicroscopes={this.onLoadMicroscopes}
							imagesPathPNG={imagesPathPNG}
							imagesPathSVG={imagesPathSVG}
							onClickHome={this.onClickHome}
							onClickOpen={this.onClickOpen}
							isDebug={this.props.isDebug}
						/>
					</div>
				);
			} else {
				return (
					<MicroMetaAppReact
						width={dims.width}
						height={dims.height}
						onLoadSchema={this.onLoadSchema}
						onLoadDimensions={this.onLoadDimensions}
						onLoadMicroscopes={this.onLoadMicroscopes}
						onLoadComponents={this.onLoadComponents}
						onLoadSettings={this.onLoadSettings}
						onLoadTierList={this.onLoadTierList}
						onSaveMicroscope={this.onWorkingDirectorySave}
						onSaveComponent={this.onWorkingDirectorySaveComponent}
						onLoadComponent={this.onLoadComponent}
						onSaveSetting={this.onWorkingDirectorySettingsSave}
						saveAllComponents={this.saveAllComponents}
						onLoadMetadata={this.onLoadMetadata}
						imagesPathPNG={imagesPathPNG}
						imagesPathSVG={imagesPathSVG}
						hasSettings={true}
						isElectron={true}
						isMMEOpen={isDefined(this.state.mmeMicroscope)}
						onClickHome={this.onClickHome}
						isDebug={this.props.isDebug}
						microscope={this.state.mmeMicroscope}
						workingDirectory={this.state.workingDirectory}
						homePath={homePath}
					/>
				);
			}
		}
	}
}
