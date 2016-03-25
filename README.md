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

### Emulate the app using the iOS simulator
```shell
appworks build --platform ios
appworks emulate --platform ios
```
Note: This is Mac OS X only. Additionally, your project must be a cordova based project. Make it a cordova based project by running ````cordova platform add ios````

### Emulate the app using the android simulator
```shell
appworks build --platform android
appworks emulate --platform android
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
