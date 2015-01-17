var Bobber = require('bobber');
var Child = require('child_process');
var Hoek = require('hoek');
var Pail = require('pail');

var internals = {
    activeRuns: [],
    defaults: {
        workspace: 'workspace'
    }
};


module.exports = internals.Bait = function (options) {

    internals.Bait.settings = Hoek.applyToDefaults(internals.defaults, options);
    this.createRun = exports.createRun;
    this.startJob = exports.startJob;
    this.cancelRun = exports.cancelRun;
    this.getRun = exports.getRun;
    this.getRunByName = exports.getRunByName;
    internals.Bait.getRunPids = exports.getRunPids;
    this.getRunPids = exports.getRunPids;
    this.getRuns = exports.getRuns;
    this.runCommand = exports.runCommand2;
    this.deleteRun = exports.deleteRun;
    this.getWorkspaceArtifact = exports.getWorkspaceArtifact;
    this.deleteWorkspace = exports.deleteWorkspace;
    this.createJob = exports.createJob;
    this.deleteJob = exports.deleteJob;
    this.updateJob = exports.updateJob;
    this.getJob = exports.getJob;
    this.getJobByName = exports.getJobByName;
    this.getJobs = exports.getJobs;
    internals.Bait.getJob = exports.getJob;
    internals.Bait.deleteWorkspace = exports.deleteWorkspace;
    internals.Bait.createRun = exports.createRun;
    internals.Bait.getRun = exports.getRun;
};

exports.createJob = function (config) {

   var jobPail = new Pail(internals.Bait.settings);
   var pail = jobPail.createPail(config);
   jobPail.createDir(pail.id + '/' + internals.Bait.settings.workspace);
   //console.log('pail id: ' + pail.id);
   return pail;
};

exports.deleteJob = function (jobId) {

   var jobPail = new Pail(internals.Bait.settings);
   jobPail.deletePail(jobId);
   return null;
};

exports.updateJob = function (jobId, payload) {

   var jobPail = new Pail(internals.Bait.settings);
   var pail = jobPail.getPail(jobId);
   // if url or branch change deleteWorkspace
   // I could maybe just have a blank scm?
/*
   if (pail.scm && pail.scm.url !== config.scm.url) {
       internals.Job.deleteWorkspace(jobId);
   }
   if (pail.scm && pail.scm.branch !== config.scm.branch) {
       internals.Job.deleteWorkspace(jobId);
   }
*/
   var config = Hoek.applyToDefaults(pail, payload);
   config.updateTime = new Date().getTime();
   var updatedPail = jobPail.updatePail(config);
   return config;
};

exports.getJob = function (jobId) {

   var jobPail = new Pail(internals.Bait.settings);
   var config = jobPail.getPail(jobId);
   return config;
};

exports.getJobByName = function (link) {

   var jobPail = new Pail(internals.Bait.settings);
   var jobId = jobPail.getPailByLink(link);
   var config = internals.Bait.getJob(jobId);
   return config;
};

exports.getJobs = function () {

   var jobPail = new Pail(internals.Bait.settings);
   var jobs = jobPail.getPails();
   var fullJobs = [];
   for (var i = 0; i < jobs.length; i++) {
       var job = internals.Bait.getJob(jobs[i]);
       fullJobs.push(job);
   }
   // sort by createTime
   fullJobs.sort(function(a, b){

      return a.createTime-b.createTime;
   });
   return fullJobs;
};

exports.createRun = function (jobId, cmds) {

   var commands = internals.buildCommandArray(cmds); 
   var config = {
       commands: commands,
       status: 'created'
   };
   var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
   var result = pail.createPail(config);
   return result;
};

exports.startJob = function (jobId) {

   console.log('starting job:  ' + jobId);
   var result = internals.startRun(jobId);
   return result;
};

exports.cancelRun = function (jobId, runId) {

   // how should i interrupt a job?
   // need to check elapsed time after it has been successfully stopped
   var config = internals.Bait.getRun(jobId, runId);
   // need to actually cancel the job here
   var pids = internals.Bait.getRunPids(jobId, runId);
   for (var i = 0; i < pids.length; i++) {
      console.log('killing pids: ' + pids[i]);
      process.kill(pids[i]);
   }
   config.status = 'cancelled';
   var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
   pail.updatePail(config);
   return config;
};

exports.getRun = function (jobId, runId) {

    //console.log('getRun jobId: ' + jobId + ' runId: ' + runId);
    var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
    var config = pail.getPail(runId);
    //console.log(config);
    if (config.finishTime) {
        config.elapsedTime = config.finishTime - config.startTime;
    }
    return config;
};

exports.getRunByName = function (jobId, link) {

    var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
    var pailId = pail.getPailByLink(link);
    var config = pail.getPail(pailId);
    return config;
};

exports.getRunPids = function (jobId, runId) {

    var pids = internals.getPids(runId);
    return pids;
};

exports.getRuns = function (jobId) {

   var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
   var runs = pail.getPails();
   return runs;
};

exports.deleteRun = function (jobId, runId) {

   var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
   pail.deletePail(runId);
   return null;
};

exports.deleteWorkspace = function (jobId) {

   var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
   pail.deleteDir(internals.Bait.settings.workspace);
   return null;
};

exports.getWorkspaceArtifact = function (jobId, artifact) {

   var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
   //console.log('getting artifact: ' + artifact);
   var contents = pail.getArtifact(internals.Bait.settings.workspace, artifact);
   return contents;
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

internals.getPids = function(runId) {

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

internals.startRun = function(jobId) {

    var jobConfig = internals.Bait.getJob(jobId);
    //console.log(jobConfig.cmds);
    var cmds = [];
    if (jobConfig.head) {
        Hoek.merge(cmds, jobConfig.head);
    }
    var checkoutCommands = [];
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       if (jobConfig.scm.type === 'git' ) {
           var bobber = new Bobber;
           checkoutCommands = bobber.getCheckoutCommands(internals.Bait.settings.dirPath + '/' + jobId + '/' + internals.Bait.settings.workspace , jobConfig.scm);
       }
       else {
           // ignore
       }
    }
    Hoek.merge(cmds, checkoutCommands);
    if (jobConfig.body) {
        Hoek.merge(cmds, jobConfig.body);
    }
    if (jobConfig.tail) {
        Hoek.merge(cmds, jobConfig.tail);
    }
    var createConfig = internals.Bait.createRun(jobId, cmds);
    var runPail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
    var getRun = runPail.getPail(createConfig.id);
    getRun.status = 'starting';
    var runConfig = runPail.updatePail(getRun);
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

    var runIndex = internals.getRunIndex(runId);
    internals.activeRuns.splice(runIndex, 1);
    var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
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

internals.runCommand = function (jobId, runId, cmdIndex, cmd, callback) {

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

internals.saveResult = function (jobId, runId, cmdIndex, result) {

    var pail = new Pail({ dirPath: internals.Bait.settings.dirPath + '/' + jobId });
    var runConfig = pail.getPail(runId);
    runConfig.commands[cmdIndex] = result;
    var updateConfig = pail.updatePail(runConfig);
};

internals.runCommands = function (jobId, runId, commands, ready) {

    internals.activeRuns.push({ runId: runId, pids: []});
    var cmdIndex = 0;
    var origDir = process.cwd();
    //console.log('changing to dir: ' + internals.Bait.settings.dirPath + '/' + internals.Bait.settings.workspace);
    var workspace = internals.Bait.settings.dirPath + '/' + jobId + '/' + internals.Bait.settings.workspace;
    process.chdir(workspace);

    iterate();

    function iterate() {

        var err = null;
        var nextCommand = commands.shift();
        if (!nextCommand) {
            process.chdir(origDir);
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
                    process.chdir(origDir);
                    return ready(jobId, runId, err);
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
