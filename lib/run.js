var Bobber = require('bobber');
var Child = require('child_process');
var Hoek = require('hoek');
var Pail = require('pail');

var internals = {
    activeRuns: []
};

module.exports = internals.Run = function (settings) {

    internals.Run.settings = settings;
    this.createRun = exports.createRun;
    this.startRun = exports.startRun;
    this.cancelRun = exports.cancelRun;
    this.getRun = exports.getRun;
    this.getRunByName = exports.getRunByName;
    this.getRunPids = exports.getRunPids;
    this.getRuns = exports.getRuns;
    this.deleteRun = exports.deleteRun;
    this.getArchiveArtifact = exports.getArchiveArtifact;
    this.getArchiveArtifacts = exports.getArchiveArtifacts;
    this.archiveArtifacts = exports.archiveArtifacts;
    internals.Run.archiveArtifacts = exports.archiveArtifacts;
    internals.Run.createRun = exports.createRun;
    internals.Run.getRun = exports.getRun;
    internals.Run.getRunPids = exports.getRunPids;
};

exports.createRun = function (jobId, cmds) {

   var commands = internals.buildCommandArray(cmds); 
   var config = {
       commands: commands,
       status: 'created'
   };
   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   var result = pail.createPail(config);
   return result;
};

exports.cancelRun = function (jobId, runId) {

   // how should i interrupt a job?
   // need to check elapsed time after it has been successfully stopped
   var config = internals.Run.getRun(jobId, runId);
   // need to actually cancel the job here
   var pids = internals.Run.getRunPids(jobId, runId);
   for (var i = 0; i < pids.length; i++) {
      console.log('killing pids: ' + pids[i]);
      process.kill(pids[i]);
   }
   config.status = 'cancelled';
   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   pail.updatePail(config);
   return config;
};

exports.getRun = function (jobId, runId) {

    //console.log('getRun jobId: ' + jobId + ' runId: ' + runId);
    var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    var config = pail.getPail(runId);
    //console.log(config);
    if (config.finishTime) {
        config.elapsedTime = config.finishTime - config.startTime;
    }
    return config;
};

exports.getRunByName = function (jobId, name) {

    var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    var pailId = pail.getPailByName(name);
    var config = pail.getPail(pailId);
    return config;
};

exports.getRunPids = function (jobId, runId) {

    //console.log('getting pids for: ' + runId);
    if (internals.activeRuns[jobId]) {
       return internals.activeRuns[jobId].pids;
    } else {
       return [];
    }
};

exports.getRuns = function (jobId) {

    var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    var runs = pail.getPails();
    var fullRuns = [];
    for (var i = 0; i < runs.length; i++) {
        var run = internals.Run.getRun(jobId, runs[i]);
        fullRuns.push(run);
    }
    // sort by createTime
    fullRuns.sort(function(a, b){

        return b.createTime-a.createTime;
    });
    return fullRuns;
};

exports.deleteRun = function (jobId, runId) {

   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   pail.deletePail(runId);
   return null;
};

exports.getArchiveArtifact = function (jobId, runId, artifact) {

   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/' + runId });
   //console.log('getting artifact: ' + artifact);
   var contents = pail.getArtifact(internals.Run.settings.archive, artifact);
   return contents;
};

exports.getArchiveArtifacts = function (jobId, runId) {

   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/' + runId });
   var files = pail.getFiles(internals.Run.settings.archive);
   return files;
};

exports.archiveArtifacts = function (jobId, runId) {

   var jobPail = new Pail({ dirPath: internals.Run.settings.dirPath });
   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   var job = jobPail.getPail(jobId);
   if (job.archive) {
       //console.log('archiving files: ' + job.archive.pattern);
       //console.log(job);
       pail.createDir(runId + '/' + internals.Run.settings.archive);
       // handle more than 1 but for now...
       pail.copyArtifact(internals.Run.settings.workspace, runId + '/' + internals.Run.settings.archive, job.archive.pattern);
   }
};

internals.buildCommandArray = function(cmds) {

   var commands = [];
   for (var i = 0; i < cmds.length; i++) {

      // parallel commands
      if (typeof cmds[i] === 'object' ) {
          var parallelCommands = [];
          for (var j = 0; j < cmds[i].length; j++) {

              var cmdObj = { command: cmds[i][j] };
              parallelCommands.push(cmdObj);
          }
          commands.push(parallelCommands);
      }
      // serial commands
      else {
          var cmdObj = { command: cmds[i] };
          commands.push(cmdObj);
      }
   }
   return commands;
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

exports.startRun = function(jobId) {

    // create workspace
    var jobPail = new Pail(internals.Run.settings);
    jobPail.createDir(jobId + '/' + internals.Run.settings.workspace);

    var jobConfig = jobPail.getPail(jobId);
    //console.log(jobConfig.cmds);
    var cmds = [];
    if (jobConfig.head) {
        Hoek.merge(cmds, jobConfig.head);
    }
    if (jobConfig.body) {
        Hoek.merge(cmds, jobConfig.body);
    }
    if (jobConfig.tail) {
        Hoek.merge(cmds, jobConfig.tail);
    }
    var createConfig = internals.Run.createRun(jobId, cmds);
    var runPail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    var getRun = runPail.getPail(createConfig.id);
    getRun.status = 'starting';
    var runConfig;
    runConfig = runPail.updatePail(getRun);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       //if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var result = bobber.checkoutCode(internals.Run.settings.dirPath + '/' + jobId + '/' + internals.Run.settings.workspace, jobConfig.scm);
           if (result.status === 'failed') {
               console.log(result.stderr);
               getRun.checkout = result;
               getRun.status = 'failed';
               getRun.finishTime = new Date().getTime();
               getRun.elapsedTime = getRun.finishTime - getRun.elapsedTime;
               runConfig = runPail.updatePail(getRun);
               return runConfig.id;
           } else {
               getRun.checkout = result;
               runConfig = runPail.updatePail(getRun);
           }
       //}
       //else {
       //    // ignore
       //}
    }
    //console.log(runConfig); 
    //console.log('starting jobId: ' + runConfig.id);
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
    internals.runCommands(jobId, runConfig.id, commands, internals.onFinish);
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

internals.onFinish = function (jobId, runId, err) {

    if (!jobId) {
        return;
    }
    delete internals.activeRuns[jobId];
    internals.Run.archiveArtifacts(jobId, runId);
    var jobPail = new Pail({ dirPath: internals.Run.settings.dirPath });
    var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    var finishConfig = pail.getPail(runId);
    var updateConfig;
    var jobConfig = jobPail.getPail(jobId);
    if (jobConfig.scm) {
       if (jobConfig.scm.type === 'git') {
          var bobber = new Bobber({});
          var workspace = internals.Run.settings.dirPath + '/' + jobId + '/' + internals.Run.settings.workspace;
          finishConfig.commit = bobber.getLatestCommit(workspace);
       }
    }
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

internals.runCommand = function (jobId, runId, cmdIndex, cmd, callback) {

    var origDir = process.cwd();
    //console.log('origDir: ' + origDir);
    var result = {};
    result.command = cmd;
    result.stderr = '';
    result.stdout = '';
    result.startTime = new Date().getTime();
    var command = internals.splitCommand(cmd);
    var workspace = internals.Run.settings.dirPath + '/' + jobId + '/' + internals.Run.settings.workspace;
    process.chdir(workspace);
    var subProcess = Child.spawn.apply(Child.spawn, [ command.cmd, command.args ]);
    process.chdir(origDir);
    //console.log(subProcess);
    result.pid = subProcess.pid;
    console.log('running command "' + cmd + '" with pid ' + result.pid);
    //console.log('adding pid: ' + subProcess.pid + ' for run: ' + runId);
    internals.activeRuns[jobId].pids.push(subProcess.pid);

    // capture stdout and stderr
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

        result.finishTime = new Date().getTime();
        result.code = code;
        result.signal = signal;
        return callback(result);
    });
};

internals.saveResult = function (jobId, runId, cmdIndex, result) {

    var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    var runConfig = pail.getPail(runId);
    runConfig.commands[cmdIndex] = result;
    var updateConfig = pail.updatePail(runConfig);
};

internals.runCommands = function (jobId, runId, commands, ready) {

    //internals.activeRuns.push({ runId: runId, pids: []});
    if (internals.activeRuns.length) {
        console.log('already have an active run');
        console.log(internals.activeRuns);
        return ready;
    }
    internals.activeRuns[jobId] = { runId: runId, pids: [] };
    var cmdIndex = 0;
    var origDir = process.cwd();
    //console.log('changing to dir: ' + internals.Run.settings.dirPath + '/' + internals.Run.settings.workspace);
    var workspace = internals.Run.settings.dirPath + '/' + jobId + '/' + internals.Run.settings.workspace;
    //process.chdir(workspace);

    iterate();

    function iterate() {

        var err = null;
        var nextCommand = commands.shift();
        if (!nextCommand) {
            //process.chdir(origDir);
            return ready(jobId, runId, null);
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
            internals.runCommand(jobId, runId, cmdIndex, nextCommand, function (result) {

                //console.log(result);
                //may need logic here to check which pid to pop 
                internals.activeRuns[jobId].pids.pop();
                internals.saveResult(jobId, runId, cmdIndex, result);
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
                    //process.chdir(origDir);
                    return ready(jobId, runId, err);
                }
                cmdIndex++;
                return iterate();
            });
        }
    }
};
