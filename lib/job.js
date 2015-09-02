var Bobber = require('bobber');
var FishHook = require('fishhook');
var Hoek = require('hoek');
var Pail = require('pail');
var Path = require('path');

var Run = require('./run');

var internals = {};

module.exports = internals.Job = function (settings) {

    internals.Job.settings = settings;
    settings.startJob = exports.startJob;
    settings.getJob = exports.getJob;
    this.deleteWorkspace = exports.deleteWorkspace;
    this.getWorkspaceArtifact = exports.getWorkspaceArtifact;
    this.startJob = exports.startJob;
    this.createJob = exports.createJob;
    this.deleteJob = exports.deleteJob;
    this.updateJob = exports.updateJob;
    this.getJob = exports.getJob;
    this.getJobByName = exports.getJobByName;
    this.getJobs = exports.getJobs;
    internals.Job.getJob = exports.getJob;
    internals.Job.deleteWorkspace = exports.deleteWorkspace;
};

exports.createJob = function (config, cb) {

    if (config.scm) {
        if (config.scm.type === 'git') {
            var bobber = new Bobber({ mock: internals.Job.settings.mock });
            bobber.validateUrl(config.scm, function (result) {

                if (!result) {
                    config.message = config.scm.url + ' was not valid.';
                    return cb(config);
                }
                internals.finalizeCreateJob(config, function (finalConfig) {

                    return cb(finalConfig);
                });
            });
        } else if (config.scm.type === 'none') {
            internals.finalizeCreateJob(config, function (finalConfig) {

                return cb(finalConfig);
            });
        } else {
            config.message = config.scm.type + ' is not supported.';
            return cb(config);
        }
    } else {
        internals.finalizeCreateJob(config, function (finalConfig) {

            return cb(finalConfig);
        });
    }
};

internals.finalizeCreateJob = function (config, cb) {

    var jobPail = new Pail(internals.Job.settings);
    var pail = jobPail.createPail(config);
    //console.log('pail id: ' + pail.id);
    if (pail.schedule && pail.schedule.type === 'cron') {
        var fishhook = new FishHook({
            getPullRequests: internals.Job.settings.getPullRequests,
            getRuns: internals.Job.settings.getRuns,
            addJob: internals.Job.settings.addJob,
            token: internals.Job.settings.github.token
        });
        fishhook.startSchedule(pail);
    }
    return cb(pail);
};

exports.deleteJob = function (jobId) {

    var jobPail = new Pail(internals.Job.settings);
    var config = jobPail.getPail(jobId);
    jobPail.deletePail(jobId);
    if (config.schedule && config.schedule.type === 'cron') {
        var fishhook = new FishHook({
            getPullRequests: internals.Job.settings.getPullRequests,
            getRuns: internals.Job.settings.getRuns,
            addJob: internals.Job.settings.addJob,
            token: internals.Job.settings.github.token
        });
        fishhook.stopSchedule(jobId);
    }
    return null;
};

exports.updateJob = function (jobId, payload, cb) {

    var jobPail = new Pail(internals.Job.settings);
    var pail = jobPail.getPail(jobId);
    var config = Hoek.applyToDefaults(pail, payload);
    if (payload.scm) {
        if (payload.scm.type === 'git') {
            var bobber = new Bobber({});
            bobber.validateUrl(payload.scm, function (result) {

                if (!result) {
                    pail.message = payload.scm.url + ' was not valid.';
                    return cb(pail);
                }
                internals.finalizeUpdateJob(config, jobPail, pail, function (finalConfig) {

                    return cb(finalConfig);
                });
            });
        } else if (payload.scm.type === 'none') {
            internals.finalizeUpdateJob(config, jobPail, pail, function (finalConfig) {

                return cb(finalConfig);
            });
        } else {
            pail.message = payload.scm.type + ' is not supported.';
            return cb(pail);
        }
    } else {
        internals.finalizeUpdateJob(config, jobPail, pail, function (finalConfig) {

            return cb(finalConfig);
        });
    }
};

internals.finalizeUpdateJob = function (config, jobPail, pail, cb) {

    config.updateTime = new Date().getTime();
    var updatedPail = jobPail.updatePail(config);
    var fishhook = new FishHook({
        getPullRequests: internals.Job.settings.getPullRequests,
        getRuns: internals.Job.settings.getRuns,
        addJob: internals.Job.settings.addJob,
        token: internals.Job.settings.github.token
    });
    if (pail.schedule && pail.schedule.type === 'cron') {
        fishhook.stopSchedule(config.id);
    }
    if (updatedPail.schedule && updatedPail.schedule.type === 'cron') {
        fishhook.startSchedule(updatedPail);
    }
    return cb(config);
};

exports.getJob = function (jobId) {

    var jobPail = new Pail(internals.Job.settings);
    var config = jobPail.getPail(jobId);
    return config;
};

exports.getJobByName = function (name) {

    var jobPail = new Pail(internals.Job.settings);
    var jobId = jobPail.getPailByName(name);
    var config = internals.Job.getJob(jobId);
    return config;
};

exports.getJobs = function () {

    var jobPail = new Pail(internals.Job.settings);
    var jobs = jobPail.getPails();
    var fullJobs = [];
    for (var i = 0; i < jobs.length; i++) {
        var job = internals.Job.getJob(jobs[i]);
        fullJobs.push(job);
    }
    // sort by name
    fullJobs.sort(function (a, b){

        // names are unique
        if (a.name > b.name) {
            return 1;
        }
        return -1;
    });
    return fullJobs;
};

exports.startJob = function (jobId, pr, cb) {

    var message = 'starting job: ' + jobId;
    if (pr) {
        message += ' pr: ' + pr.number;
    }
    console.log(message);
    var run = new Run(internals.Job.settings);
    run.startRun(jobId, pr, function (result) {

        return cb(result);
    });
};

exports.deleteWorkspace = function (jobId) {

    var pail = new Pail({ dirPath: Path.join(internals.Job.settings.dirPath, jobId) });
    pail.deleteDir(internals.Job.settings.workspace);
    return null;
};

exports.getWorkspaceArtifact = function (jobId, artifact) {

    var pail = new Pail({ dirPath: Path.join(internals.Job.settings.dirPath, jobId) });
    //console.log('getting artifact: ' + artifact);
    var contents = pail.getArtifact(internals.Job.settings.workspace, artifact);
    return contents;
};
