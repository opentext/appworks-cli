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

/* jshint node: true */

/**
 * Usage appworks [action] [options]
 *
 * Actions:
 * start    create a new appworks app from a template. defaults to starter
 * package  package the app from the current directory to be deployed on the appworks gateway.
 *          current directory must include a www directory (containing all of the js, html, and css), an
 *          app.properties file containing information about the app, including the name and version number, and
 *          optionally an icon for the app named icon.png.
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

    var parseArgs = require('minimist'),
        shell = require('shelljs'),
        propertiesReader = require('properties-reader'),
        path = require('path'),
        fs = require('fs'),
        _args = parseArgs(process.argv),
        _action = _args._.pop(),
        _repoRoot = 'https://github.com/opentext/',
        _chalk = require('chalk'),
        _debug = _args.debug,
        log = new Logger(),
        DevServer = require('./serve');

    // check if help was called
    helpCalled(_args);
    // check if version was called
    versionCalled(_args);
    // make sure we have a valid action
    throwForBadAction(_action);
    // execute the action with the options provided
    executeAction(_action, _args);

    function Logger() {
        this.log = function (msg) {
            console.log(_chalk.blue(msg));
        };

        this.error = function (msg) {
            console.log(_chalk.red(msg));
        };

        this.success = function (msg) {
            console.log(_chalk.green.bold(msg));
        }
    }

    function exitWithError(err) {
        log.error(err);
        if (_debug) {
            // print stack trace if debug mode is enabled
            throw new Error(err);
        }
        shell.exit(1);
    }

    function helpCalled(args) {
        if (args.h || args.help) {
            executeAction('help');
        }
    }

    function versionCalled(args) {
        if (args.v || args.version) {
            executeAction('version');
        }
    }

    function throwForBadAction(action) {
        var validActions = ['start', 'package', 'emulate', 'serve'],
            err = 'Unknown action. Valid actions are: ' + validActions.join(' ');

        if (validActions.indexOf(action) === -1) {
            exitWithError(err);
        }
    }

    function executeAction(action, options) {
        var actionsMapping = {
            help: executeHelp,
            start: executeStart,
            package: executePackage,
            emulate: executeEmulate,
            serve: executeServe,
            version: executeVersion
        };
        var promise = actionsMapping[action](options);
        if (typeof promise === 'undefined') {
            shell.exit(0);
        } else {
            promise.then(function () {
                shell.exit(0);
            }).catch(function () {
                shell.exit(1);
            });
        }
    }

    function executeEmulate(options) {
        shell.exec('cordova emulate ' + (options.platform || 'ios'));
    }

    function executeServe() {
        return DevServer.serve({port: 8100});
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
                log.error('Example:');
                log.error('appworks start --name myApp');
                log.error('Please revise your command and try again.');
                exitWithError('Please provide a name for your app');
            }
        }

        function checkTemplate() {
            // TODO verify that the template is a valid git repo
            return true;
        }

        function checkVersion() {
            var versionReg = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;

            if (!versionReg.test(self.version)) {
                log.error('Version must of the form x.x.x');
                log.error('Example:');
                log.error('appworks start --name myApp --version 1.0.0');
                log.error('Please revise your command and try again.');
                exitWithError('Invalid version format');
            }

        }

        function createDir() {
            try {
                if (checkDir(self.name)) {
                    log.error('Remove the directory yourself if you want to overwrite it');
                    log.error('Example:');
                    log.error('rm -rf ' + self.name);
                    // EEE -- error entry exists
                    exitWithError('Error: entry exists');
                }
            } catch (e) {
                if (e.message === 'EEE') {
                    exitWithError('Directory already exists');
                } else {
                    shell.mkdir(self.name);
                }
            }
        }

        function cloneTemplate() {
            var status;
            log.log('Cloning into ' + self.template);
            status = shell.exec('git clone ' + self.template + ' ' + self.name + ' --progress').code;
            if (status !== 0) {
                exitWithError('Could not clone repository');
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
            log.log(finishDialog);
        }

        function init() {
            // ensure a name was passed in
            checkName();
            log.log('creating a new appworks app...');
            // ensure a valid template is being used
            checkTemplate();
            log.log('using template: ' + self.template);
            // ensure the version is of the proper form
            checkVersion();
            log.log('setting version to ' + self.version);
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
            zipOptions = {
                base64: false,
                binary: true,
                compression: 'DEFLATE',
                platform: process.platform
            },
            packageFile,
            properties,
            name,
            version;

        log.log('packaging as an appworks app...');

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
        createOuterZip([mobileZipFile, iconFile, propertiesFile], packageDir + path.sep + packageFile);
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
                    // name of the path to write
                    var pathToWrite = pathToEntry.split(path.sep);
                    // exclude the name of the top level directory (windows quirk)
                    pathToWrite.shift();
                    // join the path with the separator of the host os (either backslash or forward slash)
                    pathToWrite = pathToWrite.join(path.sep);
                    // replace \\ for windows compatibility
                    pathToWrite = pathToWrite.replace(/\\/g, '/');
                    // construct a directory entry in the zip
                    zip.file(pathToWrite, fs.readFileSync(pathToEntry));
                    // log the path to screen
                    log.log(pathToWrite);
                }
            });
        }

        function createInnerZip() {
            var zip = new NodeZip(),
                data;
            shell.cp('-r', webSrcFolder + path.sep, mobileZipDir);

            addDirectoryEntriesToZip(mobileZipDir, zip);

            data = zip.generate(zipOptions);
            fs.writeFileSync(mobileZipFileName, data, {encoding: 'binary'});
        }

        function createOuterZip(entries, outputFileName) {
            var zip = new NodeZip(),
                data;
            entries.forEach(function (entry) {
                zip.file(entry, fs.readFileSync(entry));
            });
            data = zip.generate(zipOptions);
            fs.writeFileSync(outputFileName, data, {encoding: 'binary'});
        }

        function checkForImage() {
            if (!checkDir(tempDir)) {
                shell.mkdir(tempDir);
            }
            if (!checkFile(iconFile)) {
                // TODO
                // download a default icon into a tmp folder
            } else {
                shell.cp(iconFile, tempDir + path.sep + iconFile);
            }
        }

        function checkForValidSrcFolder() {
            if (!checkDir(webSrcFolder)) {
                _chalk.red('No ' + webSrcFolder + ' folder found.');
                _chalk.red('Make sure you are inside of your app directory');
                exitWithError('Required directory not found: ' + webSrcFolder);
            }
        }

        function checkForValidPropertiesFile() {
            if (!checkFile(propertiesFile)) {
                _chalk.red('No ' + propertiesFile + ' found');
                _chalk.red('Please include one and ensure that it includes the app name and version number');
                exitWithError('Required file not found: ' + propertiesFile);
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

            log.success(finishDialog);
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
            'emulate            emulate the app using the ios or android emulator. you must be inside of an cordova included appworks project (see the templates for examples) \n' +
            'serve              serve this app using the browser. launches a new browser window with the app running on port 8100 \n' +
            '\n' +
            'Options: \n' +
            '-n, --name         the name of the app \n' +
            '-v, --version      the version number of the app \n' +
            '-t, --template     a valid git repository url to clone \n' +
            '-h, --help         show this dialog \n' +
            '-d, --description  a description for this app \n' +
            '--debug            enable stack traces' +
            '\n';
        log.log(helpDialog);
    }

    function executeVersion() {
        var npmRoot = shell.exec('npm root -g', {silent: true}).stdout.replace('\n', '');
        var pathToPackage =  npmRoot + path.sep + 'appworks' + path.sep + 'package.json';
        var config = JSON.parse(fs.readFileSync(pathToPackage, 'utf8'));
        log.log(config.version);
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