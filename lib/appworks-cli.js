#! /usr/bin/env node
/*
 * appworks-cli
 * https://github.com/opentext/appworks-cli
 *
 * Copyright 2015-2016 Open Text
 *
 * Licensed under the Apache License, Version 2.0 (the "License”);
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
 * -t, --template       a valid git repository to clone
 * -h, --help           show this dialog
 * -d, --description    a description for this app
 */

(function () {
    'use strict';

    /* jshint validthis: true */
    /* jshint node: true */

    var parseArgs = require('minimist'),
        shell = require('shelljs'),
        propertiesReader = require('properties-reader'),
        path = require('path'),
        fs = require('fs'),
        _args = parseArgs(process.argv),
        _action = _args._.pop(),
        _repoRoot = 'https://github.com/opentext/';

    // check if help was called
    helpCalled(_args);
    // make sure we have a valid action
    throwForBadAction(_action);
    // execute the action with the options provided
    executeAction(_action, _args);

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

    function executeBuild(options) {
        shell.exec('cordova build ' + (options.platform || 'ios'));
    }

    function executeEmulate(options) {
        shell.exec('cordova emulate ' + (options.platform || 'ios'));
    }

    function executeServe() {
        shell.exec('ionic serve --address 127.0.0.1');
    }

    function executeStart(options) {
        var self = this;

        self.template = options.template || (_repoRoot + 'appworks-app-starter.git');
        self.name = options.name;
        self.version = options.version || '0.0.0';
        self.release = options.release || '1';
        self.description = options.description || 'An AppWorks App';
        self.awgPlatformVersion = options.awgPlatformVersion || '16';

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
            // TODO verify that the template is a valid git repo
            return true;
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
                    // EEE -- error entry exists
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
            var status;
            console.info('Cloning into ' + self.template);
            status = shell.exec('git clone ' + self.template + ' ' + self.name + ' --progress').code;
            if (status !== 0) {
                throw new Error('could not clone repository');
            }
        }

        function addProperties() {
            shell.cd(self.name);
            shell.echo('displayName=' + self.name + '\n').to('app.properties');
            shell.echo('description=' + self.description + '\n').toEnd('app.properties');
            shell.echo('version=' + self.version + '\n').toEnd('app.properties');
            shell.echo('type=app\n').toEnd('app.properties');
            shell.echo('awgPlatformVersion=' + self.awgPlatformVersion + '\n').toEnd('app.properties');
            shell.echo('\n').toEnd('app.properties');
        }

        function finish() {
            var finishDialog =
                '\n' +
                'AppWorks app successfully created \n\n' +
                'run the app: \n' +
                '$ cd ' + self.name + '\n' +
                '$ appworks build \n' +
                '$ appworks serve \n\n' +
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
            mobileZipFileName = 'mobile.zip',
            mobileZipFile = 'mobile.zip',
            mobileZipDir = 'mobile',
            iconFile = 'icon.png',
            packageDir = 'package',
            tempDir = 'awtmp' + Math.random(),
            NodeZip = require('node-zip'),
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

        // read the properties file to get name and version number
        properties = propertiesReader(propertiesFile);

        // store the name and version of the app to write to the zip
        name = removeSpaces(properties.get(nameKey));
        name = removeUnderScores(name);
        version = properties.get(versionKey);

        // define package directory and name for packaged file
        packageFile = name + '_' + version + '.zip';
        if (!checkDir(packageDir)) {
            shell.mkdir(packageDir);
        }

        // create inner level zip file => mobile.zip
        createInnerZip();
        // create final packaged zip => e.g. package/myApp_1.0.0.zip
        createOuterZip([iconFile, mobileZipFile, propertiesFile], packageDir + path.sep + packageFile);
        // remove build artifacts
        cleanUp();
        // display a dialog to the user
        finish();

        function addDirectoryEntriesToZip(dir, zip) {
            fs.readdirSync(dir).forEach(function (entry) {
                // path to the actual file
                var pathToEntry = dir + path.sep + entry;
                if (checkDir(pathToEntry)) {
                    addDirectoryEntriesToZip(pathToEntry, zip);
                } else {
                    // name of the path to write -- excludes the name of the top level directory (windows quirk)
                    var pathToWrite = pathToEntry.split(path.sep);
                    pathToWrite.shift();
                    pathToWrite = pathToWrite.join(path.sep);
                    console.log(pathToWrite);
                    zip.file(pathToWrite, fs.readFileSync(pathToEntry));
                }
            });
        }

        function createInnerZip() {
            var zip = new NodeZip(),
                data;
            shell.cp('-r', webSrcFolder + path.sep, mobileZipDir);

            addDirectoryEntriesToZip(mobileZipDir, zip);

            data = zip.generate({base64: false});
            fs.writeFileSync(mobileZipFileName, data, 'binary');
        }

        function createOuterZip(entries, outputFileName) {
            var zip = new NodeZip(),
                data;
            entries.forEach(function (entry) {
                zip.file(entry, fs.readFileSync(entry));
            });
            data = zip.generate({base64: false, compression: 'DEFLATE'});
            fs.writeFileSync(outputFileName, data, 'binary');
        }

        function checkForImage() {
            if (!checkDir(tempDir)) {
                shell.mkdir(tempDir);
            }
            if (!checkFile(iconFile)) {
                // TODO
                // download a default icon into a tmp folder
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
                'AppWorks app successfully packaged in: ' + packageDir + path.sep + packageFile + '\n\n' +
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
            'serve              serve this app using the browser. launches a new browser window with the app running on port 8100 \n' +
            '\n' +
            'Options: \n' +
            '-n, --name         the name of the app \n' +
            '-v, --version      the version number of the app \n' +
            '-t, --template     a valid git repository url to clone \n' +
            '-h, --help         show this dialog \n' +
            '-d, --description  a description for this app \n' +
            '\n';
        console.info(helpDialog);
    }

    function removeSpaces(str) {
        var newStr = '';
        if (typeof str === 'string') {
            newStr = str.replace(/\s/g, '');
        }
        return newStr;
    }

    function removeUnderScores(str) {
        var newStr = '';
        if (typeof str === 'string') {
            newStr = str.replace(/_/g, '');
        }
        return newStr;
    }

})();