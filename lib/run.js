'use strict';

const Bobber = require('bobber');
const Brag = require('brag');
const Hoek = require('hoek');
const Pail = require('pail');
const Path = require('path');
const Smelt = require('smelt');

const internals = {
    jobRuns: {},
    prRuns: {}
};

module.exports = internals.Run = function (settings) {

    internals.Run.settings = settings;
    settings.getActiveJobs = exports.getActiveJobs;
    settings.getRuns = exports.getRuns;
    this.createRun = exports.createRun;
    this.startRun = exports.startRun;
    this.cancelRun = exports.cancelRun;
    this.getRun = exports.getRun;
    this.getPreviousRun = exports.getPreviousRun;
    this.getRunByName = exports.getRunByName;
    this.getRunPids = exports.getRunPids;
    this.getRuns = exports.getRuns;
    this.deleteRun = exports.deleteRun;
    this.deleteRuns = exports.deleteRuns;
    this.deletePullRequest = exports.deletePullRequest;
    this.getArchiveArtifact = exports.getArchiveArtifact;
    this.getArchiveArtifacts = exports.getArchiveArtifacts;
    this.getActiveJobs = exports.getActiveJobs;
    this.getActivePullRequests = exports.getActivePullRequests;
    this.archiveArtifacts = exports.archiveArtifacts;
    this.fixRun = exports.fixRun;
    internals.Run.archiveArtifacts = exports.archiveArtifacts;
    internals.Run.getArchiveArtifact = exports.getArchiveArtifact;
    internals.Run.createRun = exports.createRun;
    internals.Run.getRun = exports.getRun;
    internals.Run.getPreviousRun = exports.getPreviousRun;
    internals.Run.getRuns = exports.getRuns;
    internals.Run.getRunPids = exports.getRunPids;
    internals.Run.deleteRun = exports.deleteRun;
    internals.Run.fixRun = exports.fixRun;
};

exports.getActiveJobs = function () {

    return internals.jobRuns;
};

exports.getActivePullRequests = function () {

    return internals.prRuns;
};

exports.createRun = function (jobId, pr, cmds) {

    const commands = internals.buildCommandArray(cmds);
    const config = {
        commands: commands,
        status: 'created'
    };
    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    const result = pail.createPail(config);
    return result;
};

exports.cancelRun = function (jobId, pr, runId) {

    const config = internals.Run.getRun(jobId, pr, runId);
    const pids = internals.Run.getRunPids(jobId, pr, runId);
    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    for (let i = 0; i < pids.length; ++i) {
        console.log('killing pids: ' + pids[i]);
        internals.killProcess(pids[i]);
    }
    config.status = 'cancelled';
    pail.updatePail(config);
    return config;
};

internals.killProcess = function (ppid) {

    process.kill(ppid, 'SIGTERM');
};

exports.getRun = function (jobId, pr, runId) {

    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    const config = pail.getPail(runId);
    //console.log(config);
    if (config) {
        if (config.finishTime) {
            config.elapsedTime = config.finishTime - config.startTime;
        }
    }
    else {
        console.log('no config for ' + jobId + ' ' + runId);
    }
    return config;
};

exports.getPreviousRun = function (jobId, pr, runId) {

    const runs = internals.Run.getRuns(jobId, pr);
    if (runs.length > 1) {
        // dont check last one as its not possible to have a previous
        for (let i = 0; i < runs.length - 1; ++i) {
            if (runs[i].id === runId) {
                return runs[i + 1];
            }
        }
    }
    return null;
};

exports.getRunByName = function (jobId, name) {

    const pail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId) });
    const pailId = pail.getPailByName(name);
    const config = pail.getPail(pailId);
    return config;
};

exports.getRunPids = function (jobId, pr, runId) {

    //console.log('getting pids for: ' + runId);
    if (pr) {
        if (internals.prRuns[jobId] && internals.prRuns[jobId].prs[pr.number]) {
            //return internals.prRuns[jobId].pids;
            return internals.prRuns[jobId].prs[pr.number].pids;
        }
        return [];
    }
    if (internals.jobRuns[jobId]) {
        return internals.jobRuns[jobId].pids;
    }
    return [];
};

exports.getRuns = function (jobId, pr) {

    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    const runs = pail.getPails();
    const fullRuns = [];
    for (let i = 0; i < runs.length; ++i) {
        const run = internals.Run.getRun(jobId, pr, runs[i]);
        fullRuns.push(run);
    }
    // sort by createTime
    fullRuns.sort((a, b) => {

        return b.createTime - a.createTime;
    });
    return fullRuns;
};

exports.deleteRun = function (jobId, pr, runId) {

    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    const runs = internals.Run.getRuns(jobId, null);
    let prevRunIndex = null;
    let prevRun = null;
    //console.log('deleting runId: ' + runId);
    if (runs.length > 1) {
        for (let i = 0; i < runs.length - 1; ++i) {
            //console.log('comparing ' + runs[i].id + ' to ' + runId);
            if (runs[i].id === runId) {
                prevRunIndex = i + 1;
            }
        }
        //console.log(prevRunIndex);
        prevRun = runs[prevRunIndex];
    }
    pail.deletePail(runId);
    internals.Run.fixRun(jobId, prevRun);
    return null;
};

exports.deleteRuns = function (jobId, pr) {

    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    const runs = internals.Run.getRuns(jobId, pr);
    for (let i = 0; i < runs.length; ++i) {
        const runId = runs[i].id;
        pail.deletePail(runId);
    }
    return null;
};

exports.fixRun = function (jobId, prevRun) {

    const pail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId) });
    let lastSuccess = null;
    let lastFail = null;
    let lastCancel = null;
    // move symlinks
    if (prevRun) {
        //console.log('prevRunId: ' + prevRun.id);
        const runs = internals.Run.getRuns(jobId, null);
        // if prevRun is the last Id create the name again
        if (prevRun.id === runs[0].id) {
            //console.log('creating last for: ' + runs[0].id);
            pail.createName(runs[0].id, 'last');
        }
        for (let i = 0; i < runs.length; ++i) {
            const run = runs[i];
            if (!lastSuccess && run.status === 'succeeded') {
                lastSuccess = run.id;
                pail.createName(lastSuccess, 'lastSuccess');
            }
            if (!lastSuccess && run.status === 'fixed') {
                lastSuccess = run.id;
                pail.createName(lastSuccess, 'lastSuccess');
            }
            if (!lastFail && run.status === 'failed') {
                lastFail = run.id;
                pail.createName(lastFail, 'lastFail');
            }
            if (!lastCancel && run.status === 'cancelled') {
                lastCancel = run.id;
                pail.createName(lastCancel, 'lastCancel');
            }
        }
    }
};

exports.deletePullRequest = function (jobId, number) {

    const pail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId) });
    pail.deleteDir(Path.join('pr', number.toString()));
    return null;
};

exports.getArchiveArtifact = function (jobId, runId, artifact) {

    const pail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId, runId) });
    //console.log('getting artifact: ' + artifact);
    const contents = pail.getArtifact(internals.Run.settings.archive, artifact);
    return contents;
};

exports.getArchiveArtifacts = function (jobId, runId) {

    const pail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId, runId) });
    const files = pail.getFiles(internals.Run.settings.archive);
    return files;
};

exports.archiveArtifacts = function (jobId, runId) {

    const jobPail = new Pail({ dirPath: internals.Run.settings.dirPath });
    const pail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId) });
    const job = jobPail.getPail(jobId);
    if (job.archive) {
        //console.log('archiving files: ' + job.archive.pattern);
        //console.log(job);
        pail.createDir(Path.join(runId, internals.Run.settings.archive));
        let files = [];
        if (job.archive.pattern) {
            files = job.archive.pattern.trim().split(',');
        }
        for (let i = 0; i < files.length; ++i) {
            pail.copyArtifact(internals.Run.settings.workspace, Path.join(runId, internals.Run.settings.archive), files[i]);
        }
        if (job.archive.type === 'maxdays') {
            const dayRuns = internals.Run.getRuns(jobId, null);
            const maxTime = 86400000 * job.archive.maxNumber;
            const now = new Date().getTime();
            for (let i = 0; i < dayRuns.length; ++i) {
                const ttl = now - dayRuns[i].startTime;
                if (ttl > maxTime) {
                    //console.log('deleting runId: ' + dayRuns[i].id);
                    internals.Run.deleteRun(jobId, null, dayRuns[i].id);
                }
            }
        }
        if (job.archive.type === 'maxnum') {
            const maxRuns = internals.Run.getRuns(jobId, null);
            for (let i = 0; i < maxRuns.length; ++i) {
                if (i >= job.archive.maxNumber) {
                    //console.log('deleting runId: ' + maxRuns[i].id);
                    internals.Run.deleteRun(jobId, null, maxRuns[i].id);
                }
            }
        }
    }
};

internals.buildCommandArray = function (cmds) {

    const commands = [];
    for (let i = 0; i < cmds.length; ++i) {

        // parallel commands
        let cmdObj = {};
        if (typeof cmds[i] === 'object' ) {
            const parallelCommands = [];
            for (let j = 0; j < cmds[i].length; ++j) {

                cmdObj = { command: cmds[i][j] };
                parallelCommands.push(cmdObj);
            }
            commands.push(parallelCommands);
        }
        else {
            // serial commands
            cmdObj = { command: cmds[i] };
            commands.push(cmdObj);
        }
    }
    return commands;
};

internals.initializeActiveRun = function (jobId, pr, runId) {

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
    }
    else {
        internals.jobRuns[jobId] = { runId: runId, pids: [] };
    }
};

exports.startRun = function (jobId, pr, cb) {

    if (pr) {
        //if (internals.prRuns[jobId]) {
        if (internals.prRuns[jobId] && internals.prRuns[jobId].prs[pr.number]) {
            console.log('queuing up pr: ' + pr.number + ' for jobId: ' + jobId);
            return cb(null);
        }
    }
    else {
        if (internals.jobRuns[jobId]) {
            console.log('queuing up jobId: ' + jobId);
            return cb(null);
        }
    }
    // create workspace
    const jobPail = new Pail(internals.Run.settings);
    let workspace;
    if (pr) {
        workspace = Path.join(jobId, 'pr', pr.number.toString(), internals.Run.settings.workspace);
        jobPail.createDir(Path.join(jobId, 'pr'));
        jobPail.createDir(Path.join(jobId, 'pr', pr.number.toString()));
    }
    else {
        workspace = Path.join(jobId, internals.Run.settings.workspace);
    }
    jobPail.createDir(workspace);
    const jobConfig = jobPail.getPail(jobId);
    //console.log(jobConfig.cmds);
    const cmds = [];
    if (jobConfig.head) {
        Hoek.merge(cmds, jobConfig.head);
    }
    if (jobConfig.body) {
        const cleanBody = jobConfig.body.filter((v) => {

            if (v !== '') {
                return v;
            }
        });
        Hoek.merge(cmds, cleanBody);
    }
    if (jobConfig.tail) {
        Hoek.merge(cmds, jobConfig.tail);
    }
    let createConfig;
    let runPail;
    if (pr) {
        createConfig = internals.Run.createRun(jobId, pr, cmds);
        runPail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString()) });
    }
    else {
        createConfig = internals.Run.createRun(jobId, null, cmds);
        runPail = new Pail({ dirPath: Path.join(internals.Run.settings.dirPath, jobId) });
    }
    const getRun = runPail.getPail(createConfig.id);
    getRun.status = 'starting';
    let runConfig = runPail.updatePail(getRun);
    const commands = internals.parseCommands(runConfig.commands);
    internals.initializeActiveRun(jobId, pr, createConfig.id);
    if (jobConfig.scm) {
        if (jobConfig.scm.type === 'git') {
            const bobber = new Bobber({});
            let pidsObj = null;
            if (pr) {
                pidsObj = internals.prRuns[jobId].prs[pr.number].pids;
            }
            else {
                pidsObj = internals.jobRuns[jobId].pids;
            }
            let prMock = pr;
            if (internals.Run.settings.mock) {
                prMock = null;
                pidsObj = null;
            }
            const options = {
                path: Path.join(internals.Run.settings.dirPath, workspace),
                scm: jobConfig.scm,
                pr: prMock,
                pidsObj: pidsObj
            };
            bobber.checkoutCode(options, (result) => {

                getRun.checkout = result;
                if (result.status === 'failed') {
                    console.log(result.commands[0].stderr);
                    getRun.status = 'failed';
                    getRun.finishTime = new Date().getTime();
                    getRun.elapsedTime = getRun.finishTime - getRun.elapsedTime;
                    runConfig = runPail.updatePail(getRun);
                    internals.finishRun(jobId, pr, runConfig.id, 'failed', () => {

                        return cb(runConfig.id);
                    });
                }
                else {
                    runConfig = runPail.updatePail(getRun);
                    if (jobConfig.scm.runOnCommit) {
                        //console.log('checking if commit was updated');
                        let prevCommit;
                        const runs = internals.Run.getRuns(jobId, pr);
                        if (runs.length > 1) {
                            prevCommit = runs[1].commit;
                        }
                        bobber.getLatestCommit(Path.join(internals.Run.settings.dirPath, workspace), (afterCommit) => {

                            //console.log('prevCommit: ' + prevCommit);
                            //console.log('afterCommit: ' + afterCommit);
                            if (afterCommit === prevCommit) {
                                console.log('nothing to do');
                                runPail.deletePail(createConfig.id);
                                internals.cleanPids(jobId, pr);
                                return cb(null);
                            }
                            internals.runCommands(jobId, pr, runConfig.id, commands, Hoek.ignore);
                            return cb(runConfig.id);
                        });
                    }
                    else {
                        internals.runCommands(jobId, pr, runConfig.id, commands, Hoek.ignore);
                        return cb(runConfig.id);
                    }
                }
            });
        }
        else {
            internals.runCommands(jobId, pr, runConfig.id, commands, Hoek.ignore);
            return cb(runConfig.id);
        }
    }
    else {
        internals.runCommands(jobId, pr, runConfig.id, commands, Hoek.ignore);
        return cb(runConfig.id);
    }
};

internals.parseCommands = function (cmds) {

    const commands = [];
    // need to get this back to a plain array list for exec
    for (let i = 0; i < cmds.length; ++i) {

        if (JSON.stringify(cmds[i]).match(',')) {
            const json = JSON.parse(JSON.stringify(cmds[i]));
            const parallelCommands = [];
            for (let j = 0; j < json.length; ++j) {
                parallelCommands.push(json[j].command);
            }
            commands.push(parallelCommands);
        }
        else {
            commands.push(cmds[i].command);
        }
    }
    return commands;
};

internals.cleanPids = function (jobId, pr) {

    if (pr) {
        //delete internals.prRuns[jobId];
        delete internals.prRuns[jobId].prs[pr.number];
        //console.log(internals.prRuns[jobId].prs);
        if (Object.keys(internals.prRuns[jobId].prs).length === 0) {
            //console.log('deleting prRun: ' + jobId);
            delete internals.prRuns[jobId];
        }
    }
    else {
        delete internals.jobRuns[jobId];
    }
};

internals.finishRun = function (jobId, pr, runId, err, cb) {

    const jobPail = new Pail({ dirPath: internals.Run.settings.dirPath });
    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
        internals.Run.archiveArtifacts(jobId, runId);
    }
    const pail = new Pail({ dirPath: path });
    const finishConfig = pail.getPail(runId);
    const jobConfig = jobPail.getPail(jobId);
    if (jobConfig.scm) {
        if (jobConfig.scm.type === 'git') {
            const bobber = new Bobber({});
            let workspace;
            if (pr) {
                workspace = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString(), internals.Run.settings.workspace);
            }
            else {
                workspace = Path.join(internals.Run.settings.dirPath, jobId, internals.Run.settings.workspace);
            }
            bobber.getLatestCommit(workspace, (commit) => {

                //console.log(commit);
                finishConfig.commit = commit;
                internals.finalizeFinishRun(err, jobId, pr, runId, finishConfig, jobConfig, pail);
                return cb();
            });
        }
        else {
            internals.finalizeFinishRun(err, jobId, pr, runId, finishConfig, jobConfig, pail);
            return cb();
        }
    }
    else {
        internals.finalizeFinishRun(err, jobId, pr, runId, finishConfig, jobConfig, pail);
        return cb();
    }
};

internals.finalizeFinishRun = function (err, jobId, pr, runId, finishConfig, jobConfig, pail) {

    const testFile = internals.Run.settings.getTestResult(jobId, runId);
    if (testFile) {
        finishConfig.testFile = testFile;
    }
    if (err) {
        if (err.match('signal')) {
            finishConfig.status = 'cancelled';
        }
        else {
            finishConfig.status = 'failed';
        }
    }
    else {
        // check previous run
        finishConfig.status = 'succeeded';
        const prevRun = internals.Run.getPreviousRun(jobId, pr, runId);
        //console.log(prevRun);
        if (prevRun && prevRun.status !== 'succeeded' && prevRun.status !== 'fixed') {
            finishConfig.status = 'fixed';
        }
    }
    const updateConfig = pail.updatePail(finishConfig);
    // we dont have to block on notify
    internals.notify(jobConfig, updateConfig, pr, Hoek.ignore);
    internals.cleanPids(jobId, pr);
};

internals.notify = function (jobConfig, updateConfig, pr, cb) {

    // notify
    if (jobConfig.notify && jobConfig.notify.type === 'email') {
        const brag = new Brag(internals.Run.settings.notify.plugins.email.options);
        let notifyMatch = false;
        for (let i = 0; i < jobConfig.notify.statuses.length; ++i) {
            if (updateConfig.status === jobConfig.notify.statuses[i]) {
                notifyMatch = true;
            }
        }
        if (notifyMatch) {
            //console.log('notify not success');
            let runType = 'job';
            let relativeUrl = 'job/' + jobConfig.id + '/run/' + updateConfig.id;
            if (pr) {
                runType = 'pr';
                relativeUrl = 'job/' + jobConfig.id + '/pr/' + pr.number + '/run/' + updateConfig.id;
            }
            const subject = jobConfig.notify.subject
                          .replace('{status}', updateConfig.status)
                          .replace('{tag}', internals.Run.settings.notify.plugins.email.options.subjectTag)
                          .replace('{type}', runType)
                          .replace('{name}', jobConfig.name);
            const message = jobConfig.notify.message
                          .replace('{jobId}', jobConfig.id)
                          .replace('{runId}', updateConfig.id)
                          .replace('{relativeUrl}', relativeUrl);
            const notifyOptions = {
                to: jobConfig.notify.to,
                subject: subject,
                message: message
            };
            brag.notify(notifyOptions, (notifyErr, notifyInfo) => {

                //if (notifyErr) {
                console.log(notifyErr);
                return cb();
                //}
            });
        }
        else {
            // status doesnt match so dont notify
            return cb();
        }
    }
    else {
        // nothing else supported now
        return cb();
    }
};

internals.runCommand = function (jobId, pr, runId, cmdIndex, cmd, callback) {

    //console.log('jobId: ' + jobId);
    //console.log(internals.jobRuns);
    let workspace;
    let pidsObj = [];
    if (pr) {
        workspace = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString(), internals.Run.settings.workspace);
        pidsObj = internals.prRuns[jobId].prs[pr.number].pids;
    }
    else {
        workspace = Path.join(internals.Run.settings.dirPath, jobId, internals.Run.settings.workspace);
        pidsObj = internals.jobRuns[jobId].pids;
    }
    const smelt = new Smelt({ dirPath: workspace });
    smelt.runCommand(cmd, pidsObj, (result) => {

        return callback(result);
    });
};

internals.saveResult = function (jobId, pr, runId, cmdIndex, result) {

    let path;
    if (pr) {
        path = Path.join(internals.Run.settings.dirPath, jobId, 'pr', pr.number.toString());
    }
    else {
        path = Path.join(internals.Run.settings.dirPath, jobId);
    }
    const pail = new Pail({ dirPath: path });
    const runConfig = pail.getPail(runId);
    runConfig.commands[cmdIndex] = result;
    pail.updatePail(runConfig);
};

internals.runCommands = function (jobId, pr, runId, commands, cb) {

    internals.iterateCommands(jobId, pr, runId, commands, 0, (err) => {

        internals.finishRun(jobId, pr, runId, err, () => {

            return cb();
        });
    });
};

internals.iterateCommands = function (jobId, pr, runId, commands, cmdIndex, cb) {

    let err = null;
    const nextCommand = commands.shift();
    if (!nextCommand) {
        //process.chdir(origDir);
        return cb(null);
    }
    if (typeof nextCommand === 'object') {

        console.log('parallel time: ' + nextCommand);
        // need to support parallel later
        for (let i = nextCommand.length - 1; i >= 0; --i) {
            // put commands back at the beginning
            //console.log('adding command: ' + nextCommand[i]);
            commands.unshift(nextCommand[i]);
        }
        return internals.iterateCommands(jobId, pr, runId, commands, cmdIndex, cb);
    }
    internals.runCommand(jobId, pr, runId, cmdIndex, nextCommand, (result) => {

        internals.saveResult(jobId, pr, runId, cmdIndex, result);
        if (result.code !== 0) {
            //console.log('code: ' + result.code);
            err = result.code + ': ' + result.stderr;
            //err = result.stderr;
        }
        if (result.signal) {
            //console.log(signal);
            //console.log('i received a signal ' + result.signal);
            err = result.signal + ' signal sent.';
        }
        if (result.error) {
            err = result.error;
        }
        if (err) {
            //console.log('all done due to err');
            return cb(err);
        }
        return internals.iterateCommands(jobId, pr, runId, commands, cmdIndex + 1, cb);
    });
};
