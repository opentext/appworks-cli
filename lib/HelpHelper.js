"use strict";
exports.__esModule = true;
var HelpHelper = (function () {
    function HelpHelper() {
    }
    HelpHelper.helpDialog = function () {
        return HelpHelper.dialogText;
    };
    HelpHelper.dialogText = '' +
        '\n' +
        'Usage: appworks <action> <options> \n' +
        '\n' +
        'Actions: \n' +
        'new                create a new appworks app from a template. defaults to starter \n' +
        'package            package the app from the current directory to be deployed on the appworks gateway \n' +
        'serve              serve this app using the browser. launches a new browser window with the app running on port 8100 \n' +
        '\n' +
        'Options: \n' +
        '-n, --name         the name of the app \n' +
        '-v, --version      the version number of the app \n' +
        '-t, --template     a valid git repository url to clone \n' +
        '-h, --help         show this dialog \n' +
        '-d, --description  a description for this app \n' +
        '\n';
    return HelpHelper;
}());
exports.HelpHelper = HelpHelper;
