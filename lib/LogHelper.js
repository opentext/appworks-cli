"use strict";
exports.__esModule = true;
var chalk = require("chalk");
var LogHelper = (function () {
    function LogHelper() {
    }
    LogHelper.log = function (msg) {
        console.log(chalk.blue(msg));
    };
    LogHelper.error = function (msg) {
        console.log(chalk.red(msg));
    };
    LogHelper.success = function (msg) {
        console.log(chalk.green.bold(msg));
    };
    return LogHelper;
}());
exports.LogHelper = LogHelper;
