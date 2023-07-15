import React from "react";

import { version as mmVersion } from "../package.json";
import { version as mmeVersion } from "micro-meta-explorer/package.json";
import { version as mmaVersion } from "micro-meta-app-react/package.json";

export const mma_tooltip = {
	title: "Micro-Meta App",
	content: <p>Click this button to launch Micro-Meta App.</p>,
	position: "bottom",
};

export const mme_tooltip = {
	title: "Micro-Meta Explorer",
	content: <p>Click this button to launch Micro-Meta Explorer.</p>,
	position: "bottom",
};

export const footnote = (
	<p>
		(c) Copyright 2018-2023 University of Massachusetts Chan Medical School. All
		Rights Reserved.
		<br />
		The software is distributed under the terms of the{" "}
		<a href="https://www.gnu.org/licenses/gpl-3.0.html">
			GNU General Public License v3.0.
		</a>
		<br />
		Versions: Launcher {mmVersion}, Micro-Meta App {mmaVersion}, Micro-Meta
		Explorer {mmeVersion}
	</p>
);
