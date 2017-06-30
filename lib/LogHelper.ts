import * as chalk from 'chalk';

export class LogHelper {
    static log(msg: string) {
        console.log(chalk.blue(msg));
    }

    static error(msg: string) {
        console.log(chalk.red(msg));
    }

    static success(msg: string) {
        console.log(chalk.green.bold(msg));
    }
}