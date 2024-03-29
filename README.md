# 4DN Micro-Meta App Electron

1. [Summary](#summary)
2. [Background](#background)
3. [Description](#description)
4. [Website](https://wu-bimac.github.io/MicroMetaApp.github.io/)
5. [Documentation](https://micrometaapp-docs.readthedocs.io/en/latest/index.html)
6. [Installation](https://micrometaapp-docs.readthedocs.io/en/latest/docs/intro/installation.html)
7. [Step-by-Step Instructions](https://micrometaapp-docs.readthedocs.io/en/latest/docs/tutorials/index.html#step-by-step-instructions)
8. [Tutorial Videos](https://micrometaapp-docs.readthedocs.io/en/latest/docs/tutorials/VideoTutorials.html#micro-meta-app-video-tutorials)
9. [Example data files](https://doi.org/10.5281/zenodo.4891883)

    Use these videos to get started with using Micro-Meta App after downloading the example data files:
    
    * [Part 1/2](https://vimeo.com/562022222)

    * [Part 2/2](https://vimeo.com/562022281)



## Summary
Micro-Meta App is an interactive tool that was developed by Alex Rigano in the Strambio De Castillia's lab at UMMS to facilitate the documentation of light microscopy experiments on the basis of the scalable [4DN-BINA-OME](https://zenodo.org/record/4710731) Microscopy Metadata specifications that extend the [OME Data Model](https://www.openmicroscopy.org/Schemas/Documentation/Generated/OME-2016-06/ome.html), which are now published on [BioRxiv.org](https://www.biorxiv.org/content/10.1101/2021.04.25.441198v1) and further described in our perspective manuscript on [ArXiv.org](https://arxiv.org/abs/1910.11370).

It is designed around an interactive graphical interface that intuitively guides bench scientists through the often laborious process of collecting and reporting the minimal microscopy and image acquisition metadata defined by the 4DN microscopy metadata tiered system of guidelines. 

This repository contains a stand-alone version of the tool implemented in Javascript  Javascript [Electron](https://www.electronjs.org/).

Other available implementations of Micro-Meta App include:

- A [web-app version](https://github.com/WU-BIMAC/MicroMetaApp-React) implemented in [React](https://reactjs.org/)
- A prototype [plugin version](https://github.com/WU-BIMAC/MicroMetaApp-Omero) to be integrated into the [OMERO](https://www.openmicroscopy.org/omero/scientists/).web browser

![Micro-Meta App: Create Microscope GUI](http://big.umassmed.edu/omegaweb/wp-content/uploads/2020/05/06_Build-a-Microscope_2.png)
Micro-Meta App is designed to aid in the collection of both Microscope Hardware Specifications and Image Acquisition Settings metadata. In this example, a previously saved Microscope file was selected from an available repository and opened for further editing. In order to add the metadata associated with a newly purchased objective to a Microscope file the “Magnification” drop-down menu is opened [1] and an additional “Objective” [2] is dragged onto the workspace.

## Background
Adequate recordkeeping is essential for most experiments as it is necessary in order to evaluate results, share data and allow experiments to be repeated. Keeping notes on microscopy experiments should be relatively unchallenging, as the microscope is a machine equipped with a limited number of known parts and settings. Nevertheless, to this date no widely adopted set of metadata guidelines to be recorded or published with imaging data exists. Metadata automatically recorded by microscopes from different companies vary widely and pose a substantial challenge for microscope users to create a good faith record of their work. Similarly, the complexity and aim of experiments using microscopes varies leading to different reporting requirements from the simple description of a sample to the need to document the complexities of sub-diffraction resolution imaging in living cells and beyond.
To address this challenge, the 4DN consortium has put forth a 4DN extension of the OME Core metadata model, which includes a tiered system of reporting guidelines that scales quality control and reporting requirements with experimental complexity and a comprehensive list of metadata key-value pairs that should be recorded for each tier, and a detailed explanation of why these values matter. Micro-Meta App was developed in order to lessen the recordkeeping burden, support the collection of microscopy provenance medatata and facilitate the wide adoption of these standards by  the the imaging community at large.

## Description
Micro-Meta App is a novel application that provides an interactive and intuitive approach for rigorous record-keeping in fluorescence microscopy and is based on the 4DN-OME Microscopy metadata standard and on the proposed tiered-system of guidelines.  The user’s data processing workflow consists of multiple steps:

1. First, the Manage Instrument modality (Figure 1) of the App guides the users to build a graphical representation of the microscope hardware by dragging-and-dropping individual components onto the workspace and entering the relevant attribute values based on the selected tier level. 
2. Second, Micro-Meta App generates tier-specific descriptions of the microscope hardware and exports them in a Microscope JSON file that can be used as a template and shared with the community, with a significant reduction in the recordkeeping burden. 
3. Then, in the Manage Settings modality, Micro-Meta App opens an existing Microscope JSON file, uses Bio-Formats to import available OME-compatible Image Acquisition settings from the header of image data files to be annotated, and interactively guides the user through the collection of all missing instrument-specific and tier-appropriate image acquisition settings and calibration metrics required to ensure reuse and reproducibility of image data. 
4. Finally, the App generates a Settings JSON file that, alongside with the associated Microscope JSON file, contain comprehensive descriptions of the conditions utilized to produce individual microscopy datasets, and that can be stored on the user’s file system, or on third party repositories. 

To lower the barrier of adoption of Micro-Meta App by a wide community of users the application is available as a stand-alone program, as a plugin of the OMERO web client and as a service of the 4DN data portal.
