appworks-cli
============

Command line tools for OpenText AppWorks

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/appworks-cli.svg)](https://npmjs.org/package/appworks-cli)
[![Downloads/week](https://img.shields.io/npm/dw/appworks-cli.svg)](https://npmjs.org/package/appworks-cli)
[![License](https://img.shields.io/npm/l/appworks-cli.svg)](https://github.com/opentext/appworks-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g appworks-cli
$ appworks COMMAND
running command...
$ appworks (-v|--version|version)
appworks-cli/1.0.0 win32-x64 node-v8.11.2
$ appworks --help [COMMAND]
USAGE
  $ appworks COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`appworks hello [FILE]`](#appworks-hello-file)
* [`appworks help [COMMAND]`](#appworks-help-command)

## `appworks hello [FILE]`

describe the command here

```
USAGE
  $ appworks hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ appworks hello
  hello world from ./src/hello.ts!
```

_See code: [src\commands\hello.ts](https://github.com/opentext/appworks-cli/blob/v1.0.0/src\commands\hello.ts)_

## `appworks help [COMMAND]`

display help for appworks

```
USAGE
  $ appworks help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.3/src\commands\help.ts)_
<!-- commandsstop -->
