var Bobber = require('bobber');
var Hoek = require('hoek');
var Path = require('path');
var Job = require('./job');

var internals = {};

module.exports = internals.SCM = function (settings) {

    settings.getPullRequests = exports.getPullRequests;
    internals.SCM.settings = settings;
    var job = new Job(settings);
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

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        var workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getAllCommits(workspace, function (commits) {

            return cb(commits);
        });
    } else {
        return cb([]);
    }
};

exports.getLatestCommit = function (jobId, cb) {

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        var workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getLatestCommit(workspace, function (commit) {

            return cb(commit);
        });
    } else {
        return cb(null);
    }
};

exports.getLatestRemoteCommit = function (jobId, cb) {

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        bobber.getLatestRemoteCommit(jobConfig.scm, function (commit) {

            return cb(commit);
        });
    } else {
        return cb(null);
    }
};

exports.getCompareCommits = function (jobId, startCommit, endCommit, cb) {

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        var workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getCompareCommits(workspace, startCommit, endCommit, function (commits) {

            return cb(commits);
        });
    } else {
        return cb([]);
    }
};

exports.getPullRequests = function (jobId, token, cb) {

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        var workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getPullRequests(jobConfig.scm, token, function (prs) {

            // sort by number
            prs.sort(function (a, b){

                return a.number - b.number;
            });
            return cb(prs);
        });
    } else {
        return cb([]);
    }
};

exports.getPullRequest = function (jobId, number, token, cb) {

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        var workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.getPullRequest(jobConfig.scm, number, token, function (pr) {

            return cb(pr);
        });
    } else {
        return cb(null);
    }
};

exports.mergePullRequest = function (jobId, number, token, cb) {

    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
        var bobber = new Bobber({ github: { url: internals.SCM.settings.github.url } });
        var workspace = Path.join(internals.SCM.settings.dirPath, jobId, internals.SCM.settings.workspace);
        bobber.mergePullRequest(jobConfig.scm, number, token, function (result) {

            return cb(result);
        });
    } else {
        return cb(null);
    }
};
