import {AWCliAction, ExitCode} from './index';
import {HelpHelper} from './HelpHelper';
import {VersionHelper} from './VersionHelper';
import {DevServer} from './DevServer';
import {LogHelper} from './LogHelper';
import {NewHelper} from './NewHelper';
import {PackageHelper} from './PackageHelper';

declare const Promise: any;

export class AWCliCommandDelegate {
    static parse(command: string, args: any): (args?: any) => Promise<ExitCode> {
        if (command) {
            switch (command.toLowerCase()) {
                case AWCliAction.Help:
                    /**
                     *
                     */
                    return () => {
                        return new Promise(resolve => {
                            LogHelper.log(HelpHelper.helpDialog());
                            resolve(0);
                        });
                    };
                case AWCliAction.New:
                    /**
                     * TODO
                     */
                    return (args: any) => {
                        return NewHelper.create(args);
                    };
                case AWCliAction.Package:
                    /**
                     * TODO
                     */
                    return (args: any) => {
                        return PackageHelper.package(args);
                    };
                case AWCliAction.Serve:
                    /**
                     *
                     */
                    return (args: {port: number}) => {
                        return DevServer.serve(args);
                    };
                default:
                    /**
                     *
                     */
                    return () => {
                        return new Promise((_, reject) => {
                            LogHelper.error(AWCliCommandDelegate.unknownCommandError(command));
                            reject(1);
                        });
                    };

            }
        } else if (args && (args.v || args.version)) {
            /**
             *
             */
            return () => {
                return new Promise(resolve => {
                    LogHelper.log(VersionHelper.version());
                    resolve(0);
                });
            };
        } else {
            /**
             *
             */
            return () => {
                return new Promise((_, reject) => {
                    LogHelper.error(AWCliCommandDelegate.emptyCommandError());
                    reject(1);
                });
            };
        }
    }

    private static unknownCommandError(command?: string) {
        return `\nUnknown command "${command}". Valid commands are ${JSON.stringify(Object.keys(AWCliAction))}\n`;
    }

    private static emptyCommandError() {
        return `\nLooks like you didn't provide a command.\nTry one of the following: ${JSON.stringify(Object.keys(AWCliAction))}\n`;
    }
}