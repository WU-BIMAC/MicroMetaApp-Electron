const electron = require("electron");
const path = require("path");
const url = require("url");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 1100,
		height: 720
	});
	let indexURL = url.format({
		pathname: path.join(__dirname, "src/index.html"),
		protocol: "file:",
		slashes: true
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
