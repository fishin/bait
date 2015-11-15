'use strict';

const Bobber = require('bobber');
const FishHook = require('fishhook');
const Hoek = require('hoek');
const Pail = require('pail');
const Path = require('path');

const Run = require('./run');

const internals = {};

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
            const bobber = new Bobber({ mock: internals.Job.settings.mock });
            bobber.validateUrl(config.scm, (result) => {

                if (!result) {
                    config.message = config.scm.url + ' was not valid.';
                    return cb(config);
                }
                internals.finalizeCreateJob(config, (finalConfig) => {

                    return cb(finalConfig);
                });
            });
        }
        else if (config.scm.type === 'none') {
            internals.finalizeCreateJob(config, (finalConfig) => {

                return cb(finalConfig);
            });
        }
        else {
            config.message = config.scm.type + ' is not supported.';
            return cb(config);
        }
    }
    else {
        internals.finalizeCreateJob(config, (finalConfig) => {

            return cb(finalConfig);
        });
    }
};

internals.finalizeCreateJob = function (config, cb) {

    const jobPail = new Pail(internals.Job.settings);
    const pail = jobPail.createPail(config);
    //console.log('pail id: ' + pail.id);
    if (pail.schedule && pail.schedule.type === 'cron') {
        const fishhook = new FishHook({
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

    const jobPail = new Pail(internals.Job.settings);
    const config = jobPail.getPail(jobId);
    jobPail.deletePail(jobId);
    if (config.schedule && config.schedule.type === 'cron') {
        const fishhook = new FishHook({
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

    const jobPail = new Pail(internals.Job.settings);
    const pail = jobPail.getPail(jobId);
    const config = Hoek.applyToDefaults(pail, payload);
    if (payload.scm) {
        if (payload.scm.type === 'git') {
            const bobber = new Bobber({});
            bobber.validateUrl(payload.scm, (result) => {

                if (!result) {
                    pail.message = payload.scm.url + ' was not valid.';
                    return cb(pail);
                }
                internals.finalizeUpdateJob(config, jobPail, pail, (finalConfig) => {

                    return cb(finalConfig);
                });
            });
        }
        else if (payload.scm.type === 'none') {
            internals.finalizeUpdateJob(config, jobPail, pail, (finalConfig) => {

                return cb(finalConfig);
            });
        }
        else {
            pail.message = payload.scm.type + ' is not supported.';
            return cb(pail);
        }
    }
    else {
        internals.finalizeUpdateJob(config, jobPail, pail, (finalConfig) => {

            return cb(finalConfig);
        });
    }
};

internals.finalizeUpdateJob = function (config, jobPail, pail, cb) {

    config.updateTime = new Date().getTime();
    const updatedPail = jobPail.updatePail(config);
    const fishhook = new FishHook({
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

    const jobPail = new Pail(internals.Job.settings);
    const config = jobPail.getPail(jobId);
    return config;
};

exports.getJobByName = function (name) {

    const jobPail = new Pail(internals.Job.settings);
    const jobId = jobPail.getPailByName(name);
    const config = internals.Job.getJob(jobId);
    return config;
};

exports.getJobs = function () {

    const jobPail = new Pail(internals.Job.settings);
    const jobs = jobPail.getPails();
    const fullJobs = [];
    for (let i = 0; i < jobs.length; ++i) {
        const job = internals.Job.getJob(jobs[i]);
        fullJobs.push(job);
    }
    // sort by name
    fullJobs.sort((a, b) => {

        // names are unique
        if (a.name > b.name) {
            return 1;
        }
        return -1;
    });
    return fullJobs;
};

exports.startJob = function (jobId, pr, cb) {

    let message = 'starting job: ' + jobId;
    if (pr) {
        message += ' pr: ' + pr.number;
    }
    console.log(message);
    const run = new Run(internals.Job.settings);
    run.startRun(jobId, pr, (result) => {

        return cb(result);
    });
};

exports.deleteWorkspace = function (jobId) {

    const pail = new Pail({ dirPath: Path.join(internals.Job.settings.dirPath, jobId) });
    pail.deleteDir(internals.Job.settings.workspace);
    return null;
};

exports.getWorkspaceArtifact = function (jobId, artifact) {

    const pail = new Pail({ dirPath: Path.join(internals.Job.settings.dirPath, jobId) });
    //console.log('getting artifact: ' + artifact);
    const contents = pail.getArtifact(internals.Job.settings.workspace, artifact);
    return contents;
};
