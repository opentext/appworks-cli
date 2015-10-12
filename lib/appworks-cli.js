#! /usr/bin/env node
/*
 * appworks-cli
 * https://github.com/jibrahim/appworks-cli
 *
 * Copyright (c) 2015 Jason Ibrahim
 * Licensed by OpenText Inc.
 */

/* global process */

/**
 * Usage appworks [action] [options]
 *
 * Actions:
 * start    create a new appworks app from a template. defaults to starter
 * package  package the app from the current directory to be deployed on the appworks gateway.
 *          current directory must include a www directory (containing all of the js, html, and css), an
 *          app.properties file containing information about the app, including the name and version number, and
 *          optionally an icon for the app named icon.png.
 * build    build the app to be run on the emulator. you must be inside of an cordova included appworks project (see the templates for examples)
 * emulate  emulate the app using the ios or android emulator. you must be inside of an cordova included appworks project (see the templates for examples)
 * serve    serve this app using the browser. launches a new browser window with the app running on port 8100
 *
 * Options:
 * -n, --name           the name of the app
 * -v, --version        the version number of the app
 * -t, --template       the name of the appworks template to start from. options are 'starter' and 'blank'
 * -h, --help           show this dialog
 * -d, --description    a description for this app
 */

(function () {
    'use strict';

    /* jshint validthis: true */

    var parseArgs = require('minimist'),
        shell = require('shelljs'),
        propertiesReader = require('properties-reader'),
        args = parseArgs(process.argv),
        action = args._.pop(),
        repoRoot = 'https://github.com/opentext/';

    // keep global state of arguments
    var ACTION = action;
    //NAME = args.name,
    //TEMPLATE = args.template,
    //VERSION = args.version,
    //DESCRIPTION = args.description;

    // check if help was called
    helpCalled(args);
    // make sure we have a valid action
    throwForBadAction(ACTION);
    // execute the action with the options provided
    executeAction(ACTION, args);

    function helpCalled(args) {
        if (args.h || args.help) {
            executeAction('help');
        }
    }

    function throwForBadAction(action) {
        var validActions = ['start', 'package', 'build', 'emulate', 'serve'],
            err = new Error('Unknown action. Valid actions are ' + validActions);

        if (validActions.indexOf(action) === -1) {
            throw err;
        }
    }

    function executeAction(action, options) {
        var actionsMapping = {
            help: executeHelp,
            start: executeStart,
            package: executePackage,
            build: executeBuild,
            emulate: executeEmulate,
            serve: executeServe
        };
        actionsMapping[action](options);
        shell.exit(0);
    }

    function executeBuild() {
        shell.exec('cordova build');
    }

    function executeEmulate() {
        shell.exec('cordova emulate');
    }

    function executeServe() {
        shell.exec('ionic serve --address 127.0.0.1');
    }

    function executeStart(options) {
        var self = this;

        self.template = options.template || 'appworks-starter';
        self.name = options.name;
        self.version = options.version || '0.0.0';
        self.release = options.release || '1';
        self.description = options.description || 'An AppWorks App';

        init();

        function checkName() {
            if (!self.name) {
                console.error('Example:');
                console.error('appworks start --name myApp');
                console.error('Please revise your command and try again.');
                throw new Error('Please provide a name for your app');
            }
        }

        function checkTemplate() {
            var VALID_TEMPLATES = ['appworks-starter'];
            if (VALID_TEMPLATES.indexOf(self.template) === -1) {
                console.error('Valid templates are ', VALID_TEMPLATES);
                console.error('Please revise your command and try again.');
                throw new Error('Unknown template passed in');
            }
        }

        function checkVersion() {
            var versionReg = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;

            if (!versionReg.test(self.version)) {
                console.error('Version must of the form x.x.x');
                console.error('Example:');
                console.error('appworks start --name myApp --version 1.0.0');
                console.error('Please revise your command and try again.');
                throw new Error('Invalid version format');
            }

        }

        function createDir() {
            try {
                if (checkDir(self.name)) {
                    console.error('Remove the directory yourself if you want to overwrite it');
                    console.error('Example:');
                    console.error('rm -rf ' + self.name);
                    // error entry exists
                    throw new Error('EEE');
                }
            } catch (e) {
                if (e.message === 'EEE') {
                    throw new Error('Directory already exists');
                } else {
                    shell.mkdir(self.name);
                }
            }
        }

        function cloneTemplate() {
            var path = repoRoot + self.template + '.git', status;
            console.info('Cloning into ' + path);
            status = shell.exec('git clone ' + path + ' ' + self.name + ' --progress').code;
            if (status !== 0) {
                throw new Error('could not clone repository');
            }
        }

        function addProperties() {
            shell.cd(self.name);
            shell.exec('touch app.properties');
            shell.exec('echo "displayName="' + self.name + ' >> app.properties');
            shell.exec('echo "description="' + self.description + ' >> app.properties');
            shell.exec('echo "version="' + self.version + ' >> app.properties');
            shell.exec('echo "type=app" >> app.properties');
        }

        function finish() {
            var finishDialog =
                '\n' +
                'AppWorks app successfully created \n\n' +
                'run the app: \n' +
                '$ cd ' + self.name + '\n' +
                '$ appworks build \n' +
                '$ appworks emulate \n\n' +
                'develop the app: \n' +
                '$ cd www \n' +
                '(open your favorite editor here) \n\n' +
                'package your app: \n' +
                '$ appworks package \n\n' +
                'tips: \n' +
                'the css, js, and html are inside of the www folder \n\n' +
                'make some edits and when you\'re ready to deploy your app run the following: \n\n' +
                '$ appworks package\n\n' +
                'then upload the newly created zip to your gateway';
            console.info(finishDialog);
        }

        function init() {
            // ensure a name was passed in
            checkName();
            console.log('creating a new appworks app...');
            // ensure a valid template is being used
            checkTemplate();
            console.log('using template: ' + self.template);
            // ensure the version is of the proper form
            checkVersion();
            console.log('setting version to ' + self.version);
            // create a new directory using the name
            createDir();
            // clone the template from git into the new directory
            cloneTemplate();
            // add properties file
            addProperties();
            // clean up
            finish();
        }
    }

    function executePackage() {
        var nameKey = 'displayName',
            versionKey = 'version',
            webSrcFolder = 'www',
            propertiesFile = 'app.properties',
            mobileZipFile = 'mobile.zip',
            mobileZipDir = 'mobile',
            iconFile = 'icon.png',
            packageDir = 'package',
            tempDir = 'awtmp' + Math.random(),
            packageFile,
            properties,
            name,
            version;

        console.info('packaging as an appworks app...');

        // make sure there is a www folder, this contains all of the web sources
        checkForValidSrcFolder();
        // make sure there is a properties file
        checkForValidPropertiesFile();
        // check for an image
        checkForImage();

        // create inner level zip file => mobile.zip
        shell.cp('-r', webSrcFolder + '/.', mobileZipDir);
        shell.cd(mobileZipDir);
        shell.exec('zip -r  ../' + mobileZipFile + ' .');
        shell.cd('..');

        // read the properties file to get name and version number
        properties = propertiesReader(propertiesFile);

        // store the name and version of the app to write to the zip
        name = properties.get(nameKey);
        version = properties.get(versionKey);

        // create outer level zip file
        packageFile = name + '_' + version + '.zip';
        if (!checkDir(packageDir)) {
            shell.mkdir(packageDir);
        }
        // e.g. $ zip package/myApp_1.0.0.zip icon.png mobile.zip app.properties
        shell.exec('zip ' + packageDir + '/' + packageFile + ' ' + iconFile + ' ' + mobileZipFile + ' ' + propertiesFile);

        // remove build artifacts
        cleanUp();
        // display a dialog to the user
        finish();

        function checkForImage() {
            if (!checkDir(tempDir)) {
                shell.mkdir(tempDir);
            }
            if (!checkFile(iconFile)) {
                // download a default icon into a tmp folder
                // TODO
            } else {
                shell.cp(iconFile, tempDir + '/' + iconFile);
            }
        }

        function checkForValidSrcFolder() {
            if (!checkDir(webSrcFolder)) {
                console.log('No ' + webSrcFolder + ' folder found.');
                console.log('Make sure you are inside of your app directory');
                throw new Error('Required directory not found: ' + webSrcFolder);
            }
        }

        function checkForValidPropertiesFile() {
            if (!checkFile(propertiesFile)) {
                console.log('No ' + propertiesFile + ' found');
                console.log('Please include one and ensure that it includes the app name and version number');
                throw new Error('Required file not found: ' + propertiesFile);
            }
        }


        function cleanUp() {
            shell.rm(mobileZipFile);
            shell.rm('-rf', mobileZipDir);
            shell.rm('-rf', tempDir);
        }

        function finish() {
            var finishDialog =
                '\n' +
                'AppWorks app successfully packaged in: ' + packageDir + '/' + packageFile + '\n\n' +
                'You may now deploy this zip to your gateway and run this app on your device. \n';

            console.info(finishDialog);
        }

    }

    function checkDir(dir) {
        return shell.test('-d', dir);
    }

    function checkFile(filename) {
        return shell.test('-f', filename);
    }

    function executeHelp() {
        var helpDialog =
            'Usage appworks [action] [options] \n' +
            '\n' +
            'Actions: \n' +
            'start              create a new appworks app from a template. defaults to starter \n' +
            'package            package the app from the current directory to be deployed on the appworks gateway \n' +
            'build              build the app to be run on the emulator. you must be inside of an cordova included appworks project (see the templates for examples) \n' +
            'emulate            emulate the app using the ios or android emulator. you must be inside of an cordova included appworks project (see the templates for examples) \n' +
            'serve              serve this app using the browser. launches a new browser window with the app running on port 8100 \n'+
            '\n' +
            'Options: \n' +
            '-n, --name         the name of the app \n' +
            '-v, --version      the version number of the app \n' +
            '-t, --template     the name of the appworks template to start from. options are \'starter\' and \'blank\' \n' +
            '-h, --help         show this dialog \n' +
            '-d, --description  a description for this app \n' +
            '\n';
        console.info(helpDialog);
    }

})();