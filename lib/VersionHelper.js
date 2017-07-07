"use strict";
exports.__esModule = true;
var shell = require("shelljs");
var path = require("path");
var fs = require("fs");
var VersionHelper = (function () {
    function VersionHelper() {
    }
    VersionHelper.version = function () {
        var npmRoot = shell.exec('npm root -g', { silent: true }).stdout.replace('\n', '');
        var pathToPackage = npmRoot + path.sep + 'appworks' + path.sep + 'package.json';
        var config = JSON.parse(fs.readFileSync(pathToPackage, 'utf8'));
        return config.version;
    };
    return VersionHelper;
}());
exports.VersionHelper = VersionHelper;
