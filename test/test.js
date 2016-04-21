var shell = require('shelljs');
var path = require('path');

var appTempDirectory = 'temp';

// remove temp directory if there is one
shell.rm('-rf', appTempDirectory);

// download an app template and put it into "temp" folder
runCommand('start', [{name: 'name', value: 'temp', singleDash: false}]);

// enter app template directory
shell.cd(appTempDirectory);

// run commands on app template
['package'].forEach(function (command) {
    runCommand(command, defaultArgsForCommand(command));
});

function defaultArgsForCommand(command) {
    var args = [];
    switch (command) {
        default:
            break;
    }
    return args;
}

function runCommand(command, args) {
    var argString = '';
    args.forEach(function (arg) {
        var delimiter = (arg.singleDash && '-' || '--');
        argString += delimiter + arg.name + ' ' + arg.value;
    });
    shell.exec('appworks ' + command + ' ' + argString);
}
