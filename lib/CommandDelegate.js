"use strict";
exports.__esModule = true;
var index_1 = require("./index");
var HelpHelper_1 = require("./HelpHelper");
var VersionHelper_1 = require("./VersionHelper");
var DevServer_1 = require("./DevServer");
var LogHelper_1 = require("./LogHelper");
var NewHelper_1 = require("./NewHelper");
var PackageHelper_1 = require("./PackageHelper");
var AWCliCommandDelegate = (function () {
    function AWCliCommandDelegate() {
    }
    AWCliCommandDelegate.parse = function (command, args) {
        if (command) {
            switch (command.toLowerCase()) {
                case index_1.AWCliAction.Help:
                    /**
                     *
                     */
                    return function () {
                        return new Promise(function (resolve) {
                            LogHelper_1.LogHelper.log(HelpHelper_1.HelpHelper.helpDialog());
                            resolve(0);
                        });
                    };
                case index_1.AWCliAction.New:
                    /**
                     * TODO
                     */
                    return function (args) {
                        return NewHelper_1.NewHelper.create(args);
                    };
                case index_1.AWCliAction.Package:
                    /**
                     * TODO
                     */
                    return function (args) {
                        return PackageHelper_1.PackageHelper.package(args);
                    };
                case index_1.AWCliAction.Serve:
                    /**
                     *
                     */
                    return function (args) {
                        return DevServer_1.DevServer.serve(args);
                    };
                default:
                    /**
                     *
                     */
                    return function () {
                        return new Promise(function (_, reject) {
                            LogHelper_1.LogHelper.error(AWCliCommandDelegate.unknownCommandError(command));
                            reject(1);
                        });
                    };
            }
        }
        else if (args && (args.v || args.version)) {
            /**
             *
             */
            return function () {
                return new Promise(function (resolve) {
                    LogHelper_1.LogHelper.log(VersionHelper_1.VersionHelper.version());
                    resolve(0);
                });
            };
        }
        else {
            /**
             *
             */
            return function () {
                return new Promise(function (_, reject) {
                    LogHelper_1.LogHelper.error(AWCliCommandDelegate.emptyCommandError());
                    reject(1);
                });
            };
        }
    };
    AWCliCommandDelegate.unknownCommandError = function (command) {
        return "\nUnknown command \"" + command + "\". Valid commands are " + JSON.stringify(Object.keys(index_1.AWCliAction)) + "\n";
    };
    AWCliCommandDelegate.emptyCommandError = function () {
        return "\nLooks like you didn't provide a command.\nTry one of the following: " + JSON.stringify(Object.keys(index_1.AWCliAction)) + "\n";
    };
    return AWCliCommandDelegate;
}());
exports.AWCliCommandDelegate = AWCliCommandDelegate;
