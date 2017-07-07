"use strict";
exports.__esModule = true;
var BrowserSync = require("browser-sync");
var DevServer = (function () {
    function DevServer() {
    }
    DevServer.serve = function (options) {
        return new Promise(function (resolve, reject) {
            var server = BrowserSync.create();
            server.watch('./www/*').on('change', server.reload);
            server.watch('./www/**/*').on('change', server.reload);
            server.init({
                port: options.port || DevServer.DEFAULT_HTTP_PORT,
                server: { baseDir: "./www" },
                notify: false,
                reloadDebounce: 2000,
                ui: false
            });
            server.emitter.on('exit', function () {
                resolve();
            });
            server.emitter.on('error', function (err) {
                reject(err);
            });
        });
    };
    DevServer.DEFAULT_HTTP_PORT = 8100;
    return DevServer;
}());
exports.DevServer = DevServer;
