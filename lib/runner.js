var Child = require('child_process');
var Pail = require('pail');

var internals = {
    activeRuns: []
};

module.exports = internals.Runner = function (options) {

    internals.Runner.settings = options;
    internals.Runner.runCommand = exports.runCommand;
    this.start = exports.start;
    this.getPids = exports.getPids;
    this.runCommand2 = exports.runCommand2;
    this.runCommand = exports.runCommand;
    internals.Runner.serialCall = internals.serialCall;
};

internals.splitCommand = function(cmd) {
  
    var parts = cmd.split(" ");
    var mainCommand = parts[0];
    var args = [];
    for (var i = 1; i < parts.length; i++) {
         args.push(parts[i]);
    }
    return { cmd: mainCommand, args: args };
};

exports.getPids = function(runId) {

    //console.log('getting pids for: ' + runId);
    var runIndex = internals.getRunIndex(runId);
    if (internals.activeRuns[runIndex]) {
       return internals.activeRuns[runIndex].pids;
    }
    else {
       return [];
    }
};

internals.getRunIndex = function(runId) {

    //var match = 0;
    for (var i = 0; i < internals.activeRuns.length; i++ ) {
        if (internals.activeRuns[i].runId === runId) {
            //console.log('runIndex for ' + runId + ' is ' + i);
            //match = 1;
            return i;
        }
    }
    //if (match === 0) {
        return null;
    //}
};

exports.start = function(runId) {

    var pail = new Pail(internals.Runner.settings);
    var config = pail.getPail(runId);
    config.status = 'starting';
    var runConfig = pail.updatePail(config);
    //console.log('starting runId: ' + runConfig.id);
    var commands = [];
    // need to get this back to a plain array list for exec
    for (var i = 0; i < runConfig.commands.length; i++) { 

        if (JSON.stringify(runConfig.commands[i]).match(',')) {
            var json = JSON.parse(JSON.stringify(runConfig.commands[i]));
            var parallelCommands = [];
            for (var j = 0; j < json.length; j++) {

                parallelCommands.push(json[j].command);
            }
            commands.push(parallelCommands);
        }
        else {
            commands.push(runConfig.commands[i].command);
        }
    }
    internals.runCommands(runConfig.id, commands, internals.onFinish);
    return runConfig.id;
};

/*
exports.registerQueue = function() {

   // by default it will just register with "global" queue
   console.log('made it to registerQueue');
};

internals.executeParallel = function (cmds) {

   var paraResult = [];
   for (var i = 0; i < cmds.length; i++) {
       var command = internals.splitCommand(cmds[i]);
       var subResult = internals.executeSerial(command.cmd + ' ' + command.args);
       paraResult.push(subResult);
   }
   //console.log('made it to end of loop');
   return paraResult;
};
*/

internals.onFinish = function (runId, err) {

    var runIndex = internals.getRunIndex(runId);
    internals.activeRuns.splice(runIndex, 1);
    var pail = new Pail(internals.Runner.settings);
    var finishConfig = pail.getPail(runId);
    var updateConfig;
    if (err) {
       if (err.match('signal')) {
           finishConfig.status = 'cancelled';
       }
       else {
           finishConfig.status = 'failed';
       }
       updateConfig = pail.updatePail(finishConfig);
    }
    else {
        finishConfig.status = 'succeeded';
        updateConfig = pail.updatePail(finishConfig);
    }
};

exports.runCommand = function (runId, cmdIndex, cmd, callback) {

    var origDir = process.cwd();
    //console.log('origDir: ' + origDir);
    var result = {};
    result.command = cmd;
    result.stderr = '';
    result.stdout = '';
    result.startTime = new Date().getTime();
    var command = internals.splitCommand(cmd);
    var subProcess = Child.spawn.apply(Child.spawn, [ command.cmd, command.args ]);
    result.pid = subProcess.pid;
    console.log('running command "' + cmd + '" with pid ' + result.pid);
    //console.log('adding pid: ' + subProcess.pid + ' for run: ' + runId);
    var runIndex = internals.getRunIndex(runId);
    internals.activeRuns[runIndex].pids.push(subProcess.pid);

    // capture stdout and stderr
    subProcess.stdout.on('data', function (data) {

        result.stdout += data.toString();
    });

    subProcess.stderr.on('data', function (data) {

        result.stderr += data.toString();
    });

    subProcess.on('error', function (err) {

        internals.activeRuns[runIndex].pids.pop();
        result.finishTime = new Date().getTime();
        result.status = 'failed';
        result.error = err.toString();
        return callback(result);
    });

    subProcess.on('exit', function (code, signal) {

        internals.activeRuns[runIndex].pids.pop();
        result.finishTime = new Date().getTime();
        result.code = code;
        result.signal = signal;
        return callback(result);
    });
};

internals.saveResult = function (cmdIndex, runId, result) {

    var pail = new Pail(internals.Runner.settings);
    var runConfig = pail.getPail(runId);
    runConfig.commands[cmdIndex] = result;
    var updateConfig = pail.updatePail(runConfig);
};

internals.runCommands = function (runId, commands, ready) {

    internals.activeRuns.push({ runId: runId, pids: []});
    var cmdIndex = 0;
    var origDir = process.cwd();
    //console.log('changing to dir: ' + internals.Runner.settings.dirPath + '/' + internals.Runner.settings.workspace);
    process.chdir(internals.Runner.settings.dirPath + '/' + internals.Runner.settings.workspace);

    iterate();

    function iterate() {

        var err = null;
        var nextCommand = commands.shift();
        if (!nextCommand) {
            process.chdir(origDir);
            return ready(runId, null);
        }
        if (typeof nextCommand === 'object') {

            console.log('parallel time: ' + nextCommand);
            //result = internals.executeParallel(commands[cmdIndex]);
            for (var i = nextCommand.length-1; i >= 0; i--) {
                // put commands back at the beginning
                //console.log('adding command: ' + nextCommand[i]);
                commands.unshift(nextCommand[i]);
            }
            return iterate();
        }
        else {
            internals.Runner.runCommand(runId, cmdIndex, nextCommand, function (result) {

                //console.log(result);
                internals.saveResult(cmdIndex, runId, result);
                if (result.code !== 0) {

                    //console.log('code: ' + result.code);
                    err = result.code + ': ' + result.stderr;
                    //err = result.stderr;
                };
                if (result.signal) {

                    //console.log(signal);
                    //console.log('i received a signal ' + result.signal);
                    err = result.signal + ' signal sent.';
                };
                if (result.error) {
                    err = result.error;
                }
                if (err) {
                    //console.log('all done due to err');
                    process.chdir(origDir);
                    return ready(runId, err);
                }
                cmdIndex++;
                return iterate();
            });
        }
    }
};

exports.runCommand2 = function(cmd, callback) {

    var result = {};
    result.startTime = new Date().getTime();
    var command = internals.splitCommand(cmd);
    var subProcess = Child.spawn.apply(Child.spawn, [ command.cmd, command.args ]);
    result.pid = subProcess.pid;
    console.log('running command "' + cmd + '" with pid ' + result.pid);
    // capture stdout and stderr
    result.stdout='';
    result.stderr='';
    subProcess.stdout.on('data', function (data) {

        result.stdout += data.toString();
    });

    subProcess.stderr.on('data', function (data) {

        result.stderr += data.toString();
    });

    subProcess.on('error', function (err) {

        result.finishTime = new Date().getTime();
        result.status = 'failed';
        result.error = err.toString();
        return callback(result);
    });

    subProcess.on('exit', function (code, signal) {

        if (result.stderr) {
            result.status = 'failed';
        } else {
            result.status = 'succeeded';
        }
        result.finishTime = new Date().getTime();
        result.code = code;
        result.signal = signal;
        return callback(result);
    });
};
