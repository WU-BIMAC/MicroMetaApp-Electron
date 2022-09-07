const electron = require("electron");
const path = require("path");
const url = require("url");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
require("@electron/remote/main").initialize();

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			//preload: path.join(__dirname, "src/preload.js"),
		},
		width: 1200,
		height: 820,
	});
	require("@electron/remote/main").enable(mainWindow.webContents);
	let indexURL = url.format({
		pathname: path.join(__dirname, "src/index.html"),
		protocol: "file:",
		slashes: true,
	});
	//mainWindow.loadURL(`file://${path.join(__dirname, "./src/index.html")}`);
	mainWindow.loadURL(indexURL);
	mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (mainWindow === null) {
		createWindow();
	}
});
