const path = require("path");
const env = process.env.NODE_ENV;

/**
 * @todo
 * Fill with appropriate ones such as minify plugin
 * depending on value of 'env' & consume.
 */
var plugins = [];
var mode = env === "production" ? "production" : "development";

module.exports = {
	mode: mode,
	target: "electron-main",
	entry: "./src/app.js",
	output: {
		library: "MicroMetaAppElectron", // Unsure if best naming convention
		libraryTarget: "umd",
		path: path.resolve("./build"),
		filename:
			mode === "production"
				? "MicroMetaAppElectron.min.js"
				: "MicroMetaAppElectron.dev.js",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	externals: {
		// Things which we don't transpile and expect user of library/component to have or provide.
		react: {
			commonjs: "react",
			commonjs2: "react",
			amd: "react",
			root: "React",
		},
		"react-dom": {
			commonjs: "react-dom",
			commonjs2: "react-dom",
			amd: "react-dom",
			root: "ReactDOM",
		},
	},
};
