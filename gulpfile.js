let gulp = require("gulp");
let PluginError = require("plugin-error");
let log = require("fancy-log");
let webpack = require("webpack");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let setProduction = done => {
	process.env.NODE_ENV = "production";
	done();
};

let setDev = done => {
	process.env.NODE_ENV = "development";
	done();
};

// function getReactLibraryLinkInfo() {
// 	const dependencyName = "4dn-microscopy-metadata-tool";
// 	let reactLibPath = path.resolve(__dirname, "node_modules/" + dependencyName);
// 	let isLinked = false;

// 	try {
// 		// Get exact path to dir, else leave. Used to avoid needing to webpack dependency itself.
// 		for (var i = 0; i < 10; i++) {
// 			// Incase multiple links.
// 			reactLibPath = fs.readlinkSync(reactLibPath);
// 			isLinked = true;
// 		}
// 	} catch (e) {
// 		// ... not linked
// 	}

// 	// eslint-disable-next-line no-console
// 	console.log(
// 		"`node_modules/" + dependencyName + "` directory is",
// 		isLinked ? "sym-linked to `" + reactLibPath + "`." : "NOT sym-linked."
// 	);

// 	return { isLinked, reactLibPath: isLinked ? reactLibPath : null };
// }

// function buildLinkedDependency(done) {
// 	const { isLinked, reactLibPath } = getReactLibraryLinkInfo();

// 	if (!isLinked) {
// 		// Exit
// 		done();
// 		return;
// 	}

// 	// Same as shared-portal-components own build method, but with "--watch"
// 	const subP = spawn(
// 		path.join(reactLibPath, "node_modules/.bin/babel"),
// 		[
// 			path.join(reactLibPath, "src"),
// 			"--out-dir",
// 			path.join(reactLibPath, "es"),
// 			"--env-name",
// 			"esm"
// 		],
// 		{ stdio: "inherit" }
// 	);

// 	subP.on("close", code => {
// 		done();
// 	});
// }

// function watchLinkedDependency(done){
// 	const { isLinked, reactLibPath } = getReactLibraryLinkInfo();

// 	if (!isLinked){ // Exit
// 		done();
// 		return;
// 	}

// 	// Same as shared-portal-components own build method, but with "--watch"
// 	const subP = spawn(
// 		path.join(reactLibPath, "node_modules/.bin/babel"),
// 		[
// 			path.join(reactLibPath, "src"),
// 			"--out-dir",
// 			path.join(reactLibPath, "es"),
// 			"--env-name",
// 			"esm",
// 			"--watch",
// 			"--skip-initial-build"
// 		],
// 		{ stdio: "inherit" }
// 	);

// 	subP.on("close", (code)=>{
// 		done();
// 	});
// }

function webpackOnBuild(done) {
	let start = Date.now();
	return function(err, stats) {
		if (err) {
			throw new PluginError("webpack", err);
		}
		log(
			"[webpack]",
			stats.toString({
				colors: true
			})
		);
		let end = Date.now();
		log("Build Completed, running for " + (end - start) / 1000) + "s";
		if (done) {
			done(err);
		}
	};
}

const buildWebpack = cb => {
	let webpackConfig = require("./webpack.config.js");
	webpack(webpackConfig).run(webpackOnBuild(cb));
};

const watchWebpack = () => {
	let webpackConfig = require("./webpack.config.js");
	webpack(webpackConfig).watch(300, webpackOnBuild());
};

// TODO add step in series to build node_modules/4dn-metadata-tool-react/src to node_modules/4dn-metadata-tool-react/dist maybe
const buildInternal = gulp.series(setProduction, buildWebpack);
const build = gulp.series(buildInternal, done => {
	/* todo */
	done();
});

gulp.task("dev", gulp.series(setDev, buildWebpack, watchWebpack));

gulp.task("build", gulp.series(setProduction, buildWebpack));

/** @todo */
// gulp.task("build", build);
gulp.task("build-dev", gulp.series(setDev, buildWebpack));
