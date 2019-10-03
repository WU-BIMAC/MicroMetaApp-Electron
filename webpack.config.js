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
	// Entry point to our code. This index.js (or other-name)
	// file/module should export the MicroscropyApp Component
	mode: mode,
	entry: "./src/app.js",
	output: {
		library: "MicroscopyMetadataToolStandAlone", // Unsure if best naming convention
		libraryTarget: "umd",
		path: path.resolve("./build"),
		filename:
			mode === "production"
				? "MicroscopyMetadataToolStandAlone.min.js"
				: "MicroscopyMetadataToolStandAlone.dev.js"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
	externals: {
		// Things which we don't transpile and expect user of library/component to have or provide.
		react: {
			commonjs: "react",
			commonjs2: "react",
			amd: "react",
			root: "React"
		},
		"react-dom": {
			commonjs: "react-dom",
			commonjs2: "react-dom",
			amd: "react-dom",
			root: "ReactDOM"
		}
	}
};
