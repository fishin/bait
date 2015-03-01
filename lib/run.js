var Bobber = require('bobber');
var Child = require('child_process');
var Hoek = require('hoek');
var Pail = require('pail');

var internals = {
    jobRuns: [],
    prRuns: []
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
    this.deletePullRequest = exports.deletePullRequest;
    this.getArchiveArtifact = exports.getArchiveArtifact;
    this.getArchiveArtifacts = exports.getArchiveArtifacts;
    this.archiveArtifacts = exports.archiveArtifacts;
    internals.Run.archiveArtifacts = exports.archiveArtifacts;
    internals.Run.createRun = exports.createRun;
    internals.Run.getRun = exports.getRun;
    internals.Run.getRuns = exports.getRuns;
    internals.Run.getRunPids = exports.getRunPids;
};

exports.createRun = function (jobId, pr, cmds) {

   var commands = internals.buildCommandArray(cmds); 
   var config = {
       commands: commands,
       status: 'created'
   };
   var pail;
   if (pr) {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
   } else {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   }
   var result = pail.createPail(config);
   return result;
};

exports.cancelRun = function (jobId, pr, runId) {

   var config;
   var pids = [];
   var pail;
   if (pr) {
       config = internals.Run.getRun(jobId, pr, runId);
       pids = internals.Run.getRunPids(jobId, pr, runId);
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
   } else {
       config = internals.Run.getRun(jobId, null, runId);
       pids = internals.Run.getRunPids(jobId, null, runId);
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   }
   for (var i = 0; i < pids.length; i++) {
      console.log('killing pids: ' + pids[i]);
      process.kill(pids[i]);
   }
   config.status = 'cancelled';
   pail.updatePail(config);
   return config;
};

exports.getRun = function (jobId, pr, runId) {

   var pail;
   if (pr) {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
   } else {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   }
    var config = pail.getPail(runId);
    //console.log(config);
    if (config && config.finishTime) {
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

exports.getRunPids = function (jobId, pr, runId) {

    //console.log('getting pids for: ' + runId);
    if (pr) {
        if (internals.prRuns[jobId] && internals.prRuns[jobId].prs[pr.number]) {
           //return internals.prRuns[jobId].pids;
           return internals.prRuns[jobId].prs[pr.number].pids;
        } else {
           return [];
        }
    } else {
        if (internals.jobRuns[jobId]) {
           return internals.jobRuns[jobId].pids;
        } else {
           return [];
        }
    }
};

exports.getRuns = function (jobId, pr) {

   var pail;
   if (pr) {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
   } else {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   }
    var runs = pail.getPails();
    var fullRuns = [];
    for (var i = 0; i < runs.length; i++) {
        var run;
        if (pr) {
            run = internals.Run.getRun(jobId, pr, runs[i]);
        } else {
            run = internals.Run.getRun(jobId, null, runs[i]);
        }
        fullRuns.push(run);
    }
    // sort by createTime
    fullRuns.sort(function(a, b){

        return b.createTime-a.createTime;
    });
    return fullRuns;
};

exports.deleteRun = function (jobId, pr, runId) {

   var pail;
   if (pr) {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
   } else {
       pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   }
   pail.deletePail(runId);
   return null;
};

exports.deletePullRequest = function (jobId, number) {

   var pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
   pail.deleteDir('pr/' + number);
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

exports.startRun = function(jobId, pr) {

    if (pr) {
        //if (internals.prRuns[jobId]) {
        if (internals.prRuns[jobId] && internals.prRuns[jobId].prs[pr.number]) {
            console.log('queuing up pr: ' + pr.number + ' for jobId: ' + jobId);
            return null;
        }
    } else {
        if (internals.jobRuns[jobId]) {
            console.log('queuing up jobId: ' + jobId);
            return null;
        }
   }
    // create workspace
    var jobPail = new Pail(internals.Run.settings);
    var workspace;
    if (pr) {
        workspace = jobId + '/pr/' + pr.number + '/' + internals.Run.settings.workspace;
        jobPail.createDir(jobId + '/pr');
        jobPail.createDir(jobId + '/pr/' + pr.number);
    } else {
        workspace = jobId + '/' + internals.Run.settings.workspace;
    }
    jobPail.createDir(workspace);

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
    var createConfig;
    var runPail;
    if (pr) {
        createConfig = internals.Run.createRun(jobId, pr, cmds);
        runPail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
    } else {
        createConfig = internals.Run.createRun(jobId, null, cmds);
        runPail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    }
    var getRun = runPail.getPail(createConfig.id);
    getRun.status = 'starting';
    var runConfig;
    runConfig = runPail.updatePail(getRun);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       //if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var result;
           if (pr) {
               if (internals.Run.settings.mock) {
                  result = bobber.checkoutCode(internals.Run.settings.dirPath + '/' + workspace, jobConfig.scm, null);
               } else {
                  result = bobber.checkoutCode(internals.Run.settings.dirPath + '/' + workspace, jobConfig.scm, pr);
               }
           } else {
               result = bobber.checkoutCode(internals.Run.settings.dirPath + '/' + workspace, jobConfig.scm, null);
           }
           if (result.status === 'failed') {
               console.log(result.commands[0].stderr);
               getRun.checkout = result;
               getRun.status = 'failed';
               getRun.finishTime = new Date().getTime();
               getRun.elapsedTime = getRun.finishTime - getRun.elapsedTime;
               runConfig = runPail.updatePail(getRun);
               return runConfig.id;
           } else {
               getRun.checkout = result;
               runConfig = runPail.updatePail(getRun);
               if (jobConfig.scm.runOnCommit) {
                   //console.log('checking if commit was updated');
                   var prevCommit;
                   var runs;
                   if (pr) {
                       runs = internals.Run.getRuns(jobId, pr);
                   } else {
                       runs = internals.Run.getRuns(jobId, null);
                   }
                   if (runs.length > 1) {
                       prevCommit = runs[1].commit;
                   }
                   var afterCommit = bobber.getLatestCommit(internals.Run.settings.dirPath + '/' + workspace);
                   //console.log('prevCommit: ' + prevCommit);
                   //console.log('afterCommit: ' + afterCommit);
                   if (afterCommit === prevCommit) {
                     console.log('nothing to do');
                     runPail.deletePail(createConfig.id);
                     return null;
                   }
               } else {
                   getRun.checkout = result;
                   runConfig = runPail.updatePail(getRun);
               }
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
    internals.runCommands(jobId, pr, runConfig.id, commands, internals.onFinish);
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

internals.onFinish = function (jobId, pr, runId, err) {

    //if (!jobId) {
    //    return;
    //} 
    if (pr) {
        //delete internals.prRuns[jobId];
        delete internals.prRuns[jobId].prs[pr.number];
        //console.log(internals.prRuns[jobId].prs);
        if (Object.keys(internals.prRuns[jobId].prs).length === 0) {
            //console.log('deleting prRun: ' + jobId);
            delete internals.prRuns[jobId];
        }
    } else {
        delete internals.jobRuns[jobId];
        internals.Run.archiveArtifacts(jobId, runId);
    }
    var jobPail = new Pail({ dirPath: internals.Run.settings.dirPath });
    var pail;
    if (pr) {
        pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
    } else {
        pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    }
    var finishConfig = pail.getPail(runId);
    var updateConfig;
    var jobConfig = jobPail.getPail(jobId);
    if (jobConfig.scm) {
//       if (jobConfig.scm.type === 'git') {
          var bobber = new Bobber({});
          var workspace;
          if (pr) {
              workspace = internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number + '/' + internals.Run.settings.workspace;
          } else {
              workspace = internals.Run.settings.dirPath + '/' + jobId + '/' + internals.Run.settings.workspace;
          }
          finishConfig.commit = bobber.getLatestCommit(workspace);
//       }
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

internals.runCommand = function (jobId, pr, runId, cmdIndex, cmd, callback) {

    var origDir = process.cwd();
    //console.log('origDir: ' + origDir);
    var result = {};
    result.command = cmd;
    result.stderr = '';
    result.stdout = '';
    result.startTime = new Date().getTime();
    var command = internals.splitCommand(cmd);
    var workspace;
    if (pr) {
        workspace = internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number + '/' + internals.Run.settings.workspace;
    } else {
        workspace = internals.Run.settings.dirPath + '/' + jobId + '/' + internals.Run.settings.workspace;
    }
    process.chdir(workspace);
    var subProcess = Child.spawn.apply(Child.spawn, [ command.cmd, command.args ]);
    process.chdir(origDir);
    //console.log(subProcess);
    result.pid = subProcess.pid;
    console.log('running command "' + cmd + '" with pid ' + result.pid);
    //console.log('adding pid: ' + subProcess.pid + ' for run: ' + runId);
    if (pr) {
        //internals.prRuns[jobId].pids.push(subProcess.pid);
        internals.prRuns[jobId].prs[pr.number].pids.push(subProcess.pid);
    } else {
        internals.jobRuns[jobId].pids.push(subProcess.pid);
    }

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

internals.saveResult = function (jobId, pr, runId, cmdIndex, result) {

    var pail;
    if (pr) {
        pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId + '/pr/' + pr.number });
    } else {
        pail = new Pail({ dirPath: internals.Run.settings.dirPath + '/' + jobId });
    }
    var runConfig = pail.getPail(runId);
    runConfig.commands[cmdIndex] = result;
    var updateConfig = pail.updatePail(runConfig);
};

internals.runCommands = function (jobId, pr, runId, commands, ready) {

    if (pr) {
        //internals.prRuns[jobId] = { runId: runId, pids: [] };
        if (!internals.prRuns[jobId]) {
            // initialize prs
            internals.prRuns[jobId] = {
                prs: {}
            };
        }
        internals.prRuns[jobId].prs[pr.number] = { runId: runId, pids: [] };
        //console.log(internals.prRuns);
    } else {
        internals.jobRuns[jobId] = { runId: runId, pids: [] };
    }
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
            return ready(jobId, pr, runId, null);
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
            internals.runCommand(jobId, pr, runId, cmdIndex, nextCommand, function (result) {

                //console.log(result);
                //may need logic here to check which pid to pop 
                if (pr) {
                    //internals.prRuns[jobId].pids.pop();
                    internals.prRuns[jobId].prs[pr.number].pids.pop();
                } else {
                    internals.jobRuns[jobId].pids.pop();
                }
                internals.saveResult(jobId, pr, runId, cmdIndex, result);
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
                    return ready(jobId, pr, runId, err);
                }
                cmdIndex++;
                return iterate();
            });
        }
    }
};
