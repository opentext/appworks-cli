# appworks-cli

command line tools for appworks

## Getting Started

### Install git

On Mac, you can install git with the Xcode command line tools:
```shell
xcode-select --install
```

On windows, download the git installer
```
https://git-scm.com/download/win
```

### Install Node.js and npm
You must have Node version <b>5.9.1</b> or later and npm version <b>3.7.3</b> or later to use the command line tools.
Visit <a href="https://nodejs.org/en/">nodejs.org</a> to download the latest version of Node that includes npm.

### Install the command line tools:
```shell
npm install -g cordova ionic appworks
```
## Usage

### Create an app from a template:

```shell
appworks start --name myApp --template https://github.com/opentext/appworks-app-starter
cd myApp
```

### Serve the app in your browser
```shell
appworks serve
```

### Package your app for deployment
```shell
appworks package
```
Note: You must have an icon.png file in the root of your project for this command to execute successfully.

## Troubleshooting
Make sure you have git installed on your machine

On Mac, you can install git with the Xcode command line tools.

Open terminal and paste in the following:

```shell
xcode-select --install
```

On windows, download the git installer
```
https://git-scm.com/download/win
```

## License
Copyright (c) 2015 OpenText Inc
