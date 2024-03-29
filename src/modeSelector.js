import React from "react";
import Button from "react-bootstrap/Button";

import PopoverTooltip from "micro-meta-app-react/es/components/popoverTooltip";

const url = require("url");

import {
	number_logo_width,
	number_logo_height,
	string_logo_img_micro_bk,
	string_manage_hardware_circle_img,
	string_manage_settings_circle_img,
} from "micro-meta-app-react/es/constants";

import { mme_tooltip, mma_tooltip, footnote } from "./constants";

export default class ModeSelector extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const wrapperContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: "100%",
			height: "100%",
			alignItems: "center",
			minHeight: "600px",
		};

		const mainContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: "100%",
			height: "100%",
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
		const modeSelectorContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "row",
			width: "100%",
			height: "60%",
			alignItems: "flex-start",
		};
		const buttonModeSelectorStyle = {
			width: "388px",
			height: "300px",
			marginTop: "20px",
			marginLeft: "10px",
			marginRight: "10px",
		};
		const buttonsInnerContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: "100%",
			height: "100%",
			alignItems: "center",
		};
		const buttonsInnerTopContainer = {
			display: "flex",
			justifyContent: "center",
			flexFlow: "column",
			width: "100%",
			height: "50%",
			alignItems: "center",
		};
		const buttonsInnerBottomContainer = {
			display: "flex",
			justifyContent: "flex-start",
			flexFlow: "column",
			width: "100%",
			height: "50%",
			alignItems: "center",
		};

		let styleIconImage = {
			width: "100%",
			height: "100%",
			margin: "5px",
		};
		let styleText_1 = {
			wordBreak: "break-word",
			whiteSpace: "normal",
		};
		let styleText_2 = {
			textAlign: "left",
			fontSize: "0.8em",
			marginLeft: "15px",
			marginRight: "15px",
			wordBreak: "break-word",
			whiteSpace: "normal",
		};
		let selectionEnabled = true;

		let logoImg = url.resolve(
			this.props.imagesPathPNG,
			string_logo_img_micro_bk
		);
		let hardwareImg = url.resolve(
			this.props.imagesPathSVG,
			string_manage_hardware_circle_img
		);
		let settingsImg = url.resolve(
			this.props.imagesPathSVG,
			string_manage_settings_circle_img
		);

		let logoPath =
			logoImg +
			(logoImg.indexOf("githubusercontent.com") > -1 ? "?sanitize=true" : "");
		let hardwareImgPath =
			hardwareImg +
			(hardwareImg.indexOf("githubusercontent.com") > -1
				? "?sanitize=true"
				: "");
		let settingsImgPath =
			settingsImg +
			(settingsImg.indexOf("githubusercontent.com") > -1
				? "?sanitize=true"
				: "");
		return (
			<div style={wrapperContainer}>
				<div style={mainContainer}>
					<div style={logoContainer}>
						<div style={styleImageContainer}>
							<img src={logoPath} alt={logoImg} style={styleImage} />
						</div>
					</div>
					<div style={modeSelectorContainer}>
						<PopoverTooltip
							position={mme_tooltip.position}
							title={mme_tooltip.title}
							content={mme_tooltip.content}
							element={
								<Button
									disabled={!selectionEnabled || !this.props.hasExplorer}
									onClick={this.props.onClickMME}
									style={buttonModeSelectorStyle}
									size="lg"
									variant="light"
								>
									{
										<div style={buttonsInnerContainer}>
											<div style={buttonsInnerTopContainer}>
												<img
													src={hardwareImgPath}
													alt={this.props.hardwareImg}
													style={styleIconImage}
												/>
											</div>
											<div style={buttonsInnerBottomContainer}>
												<h2 style={styleText_1}>Micro-Meta Explorer</h2>
												<p style={styleText_2}>
													Compare the hardware components of different available
													microscopes and select the one you are interested in.
												</p>
											</div>
										</div>
									}
								</Button>
							}
						/>
						<PopoverTooltip
							position={mma_tooltip.position}
							title={mma_tooltip.title}
							content={mma_tooltip.content}
							element={
								<Button
									disabled={!selectionEnabled}
									onClick={this.props.onClickMMA}
									style={buttonModeSelectorStyle}
									size="lg"
									variant="light"
								>
									{
										<div style={buttonsInnerContainer}>
											<div style={buttonsInnerTopContainer}>
												<img
													src={settingsImgPath}
													alt={settingsImg}
													style={styleIconImage}
												/>
											</div>
											<div style={buttonsInnerBottomContainer}>
												<h2 style={styleText_1}>Micro-Meta App</h2>
												<p style={styleText_2}>
													Collect information about the microscope hardware
													components and the image acquisition settings
													associated with specific datasets.
												</p>
											</div>
										</div>
									}
								</Button>
							}
						/>
					</div>
					{footnote}
				</div>
			</div>
		);
		//}
	}
}
