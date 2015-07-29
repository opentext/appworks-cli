#! /usr/bin/env node
/*
 * appworks-cli
 * https://github.com/jibrahim/appworks-cli
 *
 * Copyright (c) 2015 Jason Ibrahim
 * Licensed by OpenText Inc.
 */

/**
 * Usage appworks [action] [options]
 *
 * Actions:
 * start    create a new appworks app from a template. defaults to starter
 * package  package the app from the current directory to be deployed on the appworks gateway
 *
 * Options:
 * -n, --name       the name of the app
 * -v, --version    the version number of the app
 * -t, --template   the name of the appworks template to start from. options are 'starter' and 'blank'
 * -h, --help       show this dialog
 */

'use strict';

var parseArgs = require('minimist'),
    args = parseArgs(process.argv),
    action = args._.pop();

// keep global state of arguments
var ACTION = action,
    NAME = args.name,
    TEMPLATE = args.template,
    VERSION = args.version;


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
    var validActions = ['start', 'package'],
        err = new Error('Unknown action. Valid actions are \'start\', \'package\'');

    if (validActions.indexOf(action) === -1) {
        throw err;
    }
}

function executeAction(action, options) {
    var actionsMapping = {
        help: executeHelp,
        start: executeStart,
        package: executePackage
    };
    actionsMapping[action](options);
    process.exit();
}

function executeStart(options) {
    var template = options.template || 'starter',
        name = options.name,
        version = options.version || '0.0.0';

    init();

    function checkName() {
        if (!name) {
            console.error('Error: Please provide a name for your app');
            console.error('Example:');
            console.error('appworks start --name myApp');
            console.log('Please revise your command and try again.')
            process.exit();
        }
    }

    function checkTemplate() {
        var VALID_TEMPLATES = ['starter'];
        if (VALID_TEMPLATES.indexOf(template) === -1) {
            console.error('Error: Unknown template passed in');
            console.error('Valid templates are ', VALID_TEMPLATES);
            console.log('Please revise your command and try again.')
            process.exit();
        }
    }

    function checkVersion() {
        var versionReg = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;

        if (!versionReg.test(version)) {
            console.error('Error: Invalid version format');
            console.log('Version must of the form x.x.x');
            console.log('Example:');
            console.log('appworks start --name myApp --version 1.0.0');
            console.log('Please revise your command and try again.');
            process.exit();
        }

    }

    function init() {
        // ensure a name was passed in
        checkName();
        console.log('creating a new appworks app...');
        // ensure a valid template is being used
        checkTemplate();
        console.log('using template: ' + template);
        // ensure the version is of the proper form
        checkVersion();
        console.log('setting version to ' + version);
        // create a new directory using the name
        // TODO
        // clone the template from git into the new directory
        // TODO
    }
}

function executePackage(options) {
    console.log('packaging as an appworks app...');
    console.log(options);
}

function executeHelp() {
    var helpDialog =
        'Usage appworks [action] [options] \n' +
        '\n' +
        'Actions: \n' +
        'start              create a new appworks app from a template. defaults to starter \n' +
        'package            package the app from the current directory to be deployed on the appworks gateway \n' +
        '\n' +
        'Options: \n' +
        '-n, --name         the name of the app \n' +
        '-v, --version      the version number of the app \n' +
        '-t, --template     the name of the appworks template to start from. options are \'starter\' and \'blank\' \n' +
        '-h, --help         show this dialog \n' +
        '\n';
    console.info(helpDialog);
}