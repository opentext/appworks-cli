var DEFAULT_HTTP_PORT = 8100;

var bs = require("browser-sync").create();
var q = require('q');

var DevServer = {
    serve: function (options) {
        var deferred = q.defer();

        bs.watch(['./www/**/*', './www/*']).on('change', bs.reload);

        bs.init({
            port: options.port || DEFAULT_HTTP_PORT,
            server: "./www",
            notify: false,
            reloadDebounce: 2000,
            ui: false
        });

        bs.emitter.on('exit', function () {
            deferred.resolve();
        });

        bs.emitter.on('error', function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
};

module.exports = DevServer;