#! /usr/bin/env node

/*
 * appworks-cli
 * https://github.com/opentext/appworks-cli
 *
 * Copyright 2015-2016 Open Text
 *
 * Licensed under the Apache License, Version 2.0 (the "License”);
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as minimist from 'minimist';
import {AWCliCommandDelegate} from './CommandDelegate';
import * as shell from 'shelljs';
import {LogHelper} from './LogHelper';

const args = minimist(process.argv);

export type ExitCode = 0 | 1;

export enum AWCliAction {
    Help='help',
    Serve='serve',
    Package='package',
    New='new'
}

export function main() {
    const command = args._[2];
    const action = AWCliCommandDelegate.parse(command, args);
    action(args).then((code: ExitCode) => {
        shell.exit(code);
    }).catch((err) => {
        LogHelper.error(err);
        shell.exit(1);
    });
}

main();