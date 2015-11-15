'use strict';

const Bobber = require('bobber');
const Path = require('path');
const Job = require('./job');

const internals = {};

module.exports = internals.SCM = function (settings) {

    settings.getPullRequests = exports.getPullRequests;
    internals.SCM.settings = settings;
    const job = new Job(settings);
    internals.SCM.getJob = job.getJob;
    this.getAllCommits = exports.getAllCommits;
    this.getCompareCommits = exports.getCompareCommits;
    this.getPullRequests = exports.getPullRequests;
    this.getPullRequest = exports.getPullRequest;
    this.mergePullRequest = exports.mergePullRequest;
    this.getLatestCommit = exports.getLatestCommit;
    this.getLatestRemoteCommit = exports.getLatestRemoteCommit;
};

exports.getAllCommits = function (jobId, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        const workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getAllCommits(workspace, (commits) => {

            return cb(commits);
        });
    }
    else {
        return cb([]);
    }
};

exports.getLatestCommit = function (jobId, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        const workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getLatestCommit(workspace, (commit) => {

            return cb(commit);
        });
    }
    else {
        return cb(null);
    }
};

exports.getLatestRemoteCommit = function (jobId, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        bobber.getLatestRemoteCommit(jobConfig.scm, (commit) => {

            return cb(commit);
        });
    }
    else {
        return cb(null);
    }
};

exports.getCompareCommits = function (jobId, startCommit, endCommit, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        const workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getCompareCommits(workspace, startCommit, endCommit, (commits) => {

            return cb(commits);
        });
    }
    else {
        return cb([]);
    }
};

exports.getPullRequests = function (jobId, token, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        bobber.getPullRequests(jobConfig.scm, token, (prs) => {

            // sort by number
            prs.sort((a, b) => {

                return a.number - b.number;
            });
            return cb(prs);
        });
    }
    else {
        return cb([]);
    }
};

exports.getPullRequest = function (jobId, number, token, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        bobber.getPullRequest(jobConfig.scm, number, token, (pr) => {

            return cb(pr);
        });
    }
    else {
        return cb(null);
    }
};

exports.mergePullRequest = function (jobId, number, token, cb) {

    const jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        const bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        bobber.mergePullRequest(jobConfig.scm, number, token, (result) => {

            return cb(result);
        });
    }
    else {
        return cb(null);
    }
};
