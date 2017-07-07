"use strict";
exports.__esModule = true;
var index_1 = require("./index");
var AWCliArgumentParser = (function () {
    function AWCliArgumentParser() {
    }
    AWCliArgumentParser.parse = function (args) {
        return index_1.AWCliAction.Help;
    };
    return AWCliArgumentParser;
}());
exports.AWCliArgumentParser = AWCliArgumentParser;
