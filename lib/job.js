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

exports.createJob = function (config) {

    if (config.scm) {
        if (config.scm.type === 'git') {
            var bobber = new Bobber({ mock: internals.Job.settings.mock });
            if (!bobber.validateUrl(config.scm)) {
                config.message = config.scm.url + ' was not valid.';
                return config;
            }
        } else {
            config.message = config.scm.type + ' is not supported.';
            return config;
        }
    }
    var jobPail = new Pail(internals.Job.settings);
    var pail = jobPail.createPail(config);
    //console.log('pail id: ' + pail.id);
    if (pail.schedule && pail.schedule.type === 'cron') {
        var fishhook = new FishHook({ startJob: internals.Job.settings.addJob });
        fishhook.startSchedule(pail);
    }
    return pail;
};

exports.deleteJob = function (jobId) {

    var jobPail = new Pail(internals.Job.settings);
    var config = jobPail.getPail(jobId);
    jobPail.deletePail(jobId);
    if (config.schedule && config.schedule.type === 'cron') {
        var fishhook = new FishHook({ startJob: internals.Job.settings.addJob });
        fishhook.stopSchedule(jobId);
    }
    return null;
};

exports.updateJob = function (jobId, payload) {

    var jobPail = new Pail(internals.Job.settings);
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
    if (payload.scm) {
        if (payload.scm.type === 'git') {
            var bobber = new Bobber({});
            if (!bobber.validateUrl(payload.scm)) {
                pail.message = payload.scm.url + ' was not valid.';
                return pail;
            }
        } else {
            pail.message = payload.scm.type + ' is not supported.';
            return pail;
        }
    }
    var config = Hoek.applyToDefaults(pail, payload);
    config.updateTime = new Date().getTime();
    var updatedPail = jobPail.updatePail(config);
    var fishhook = new FishHook({ startJob: internals.Job.settings.addJob });
    if (pail.schedule && pail.schedule.type === 'cron') {
        fishhook.stopSchedule(jobId);
    }
    if (updatedPail.schedule && updatedPail.schedule.type === 'cron') {
        fishhook.startSchedule(updatedPail);
    }
    return config;
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

exports.startJob = function (jobId, pr) {

    console.log('starting job:  ' + jobId);
    var run = new Run(internals.Job.settings);
    var result = run.startRun(jobId, pr);
    return result;
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
