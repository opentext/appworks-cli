import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

export class VersionHelper {
    static version() {
        const npmRoot = shell.exec('npm root -g', {silent: true}).stdout.replace('\n', '');
        const pathToPackage =  npmRoot + path.sep + 'appworks' + path.sep + 'package.json';
        const config = JSON.parse(fs.readFileSync(pathToPackage, 'utf8'));
        return config.version;
    }
}