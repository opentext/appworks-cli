#! /usr/bin/env node
"use strict";
exports.__esModule = true;
var minimist = require("minimist");
var CommandDelegate_1 = require("./CommandDelegate");
var shell = require("shelljs");
var LogHelper_1 = require("./LogHelper");
var args = minimist(process.argv);
var AWCliAction;
(function (AWCliAction) {
    AWCliAction["Help"] = "help";
    AWCliAction["Serve"] = "serve";
    AWCliAction["Package"] = "package";
    AWCliAction["New"] = "new";
})(AWCliAction = exports.AWCliAction || (exports.AWCliAction = {}));
function main() {
    var command = args._[2];
    var action = CommandDelegate_1.AWCliCommandDelegate.parse(command, args);
    action(args).then(function (code) {
        shell.exit(code);
    })["catch"](function (err) {
        LogHelper_1.LogHelper.error(err);
        shell.exit(1);
    });
}
exports.main = main;
main();
