appworks-cli
============

Command line tools for OpenText AppWorks

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/appworks.svg)](https://npmjs.org/package/appworks)
[![Downloads/week](https://img.shields.io/npm/dw/appworks.svg)](https://npmjs.org/package/appworks)
[![License](https://img.shields.io/npm/l/appworks.svg)](https://github.com/opentext/appworks-cli/blob/master/package.json)

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
* [`appworks help [COMMAND]`](#appworks-help-command)
* [`appworks package [DIRECTORY]`](#appworks-package-directory)
* [`appworks start [REPO]`](#appworks-start-repo)

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

## `appworks package [DIRECTORY]`

Package the app in the current directory to be deployed on the AppWorks Gateway

```
USAGE
  $ appworks package [DIRECTORY]

OPTIONS
  -d, --dir=dir  the directory to package for deployment - this directory contains your application's final javascript,
                 html, css, images, and any other assets

  -f, --force

  -h, --help     show CLI help

EXAMPLES
  $ appworks package
  packaging the 'www' directory for deployment...

  $ appworks package --dir build
  packaging the 'build' directory for deployment...
```

_See code: [src\commands\package.ts](https://github.com/opentext/appworks-cli/blob/v1.0.0/src\commands\package.ts)_

## `appworks start [REPO]`

Create a new appworks app from a template. Defaults to `starter`

```
USAGE
  $ appworks start [REPO]

OPTIONS
  -f, --force
  -h, --help               show CLI help
  -t, --template=template  git repository to clone

EXAMPLES
  $ appworks start
  cloning repository https://github.com/opentext/appworks-app-starter...

  $ appworks start --template https://github.com/opentext/appworks-js-example-camera
  cloning repository https://github.com/opentext/appworks-js-example-camera...
```

_See code: [src\commands\start.ts](https://github.com/opentext/appworks-cli/blob/v1.0.0/src\commands\start.ts)_
<!-- commandsstop -->
