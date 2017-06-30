import * as BrowserSync from 'browser-sync';

declare const Promise: any;

export class DevServer {

    private static readonly DEFAULT_HTTP_PORT = 8100;

    static serve(options: {port: number}) {
        return new Promise((resolve, reject) => {
            const server = BrowserSync.create();
            server.watch('./www/*').on('change', server.reload);
            server.watch('./www/**/*').on('change', server.reload);

            server.init({
                port: options.port || DevServer.DEFAULT_HTTP_PORT,
                server: {baseDir: "./www"},
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
    }
}