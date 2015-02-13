var Bobber = require('bobber');
var Hoek = require('hoek');
var Job = require('./job');

var internals = {};

module.exports = internals.SCM = function (settings) {

    internals.SCM.settings = settings;
    var job = new Job(settings);
    internals.SCM.getJob = job.getJob;
    this.getAllCommits = exports.getAllCommits;
    this.getCompareCommits = exports.getCompareCommits;
    this.getPullRequests = exports.getPullRequests;
    this.getOpenPullRequests = exports.getOpenPullRequests;
};

exports.getAllCommits = function(jobId) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           var commits = bobber.getAllCommits(workspace);
           return commits;
       } else {
           return [];
       }
    } else {
        return [];
    }
};

exports.getCompareCommits = function(jobId, startCommit, endCommit) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           var commits = bobber.getCompareCommits(workspace, startCommit, endCommit);
           return commits;
       } else {
           return [];
       }
    } else {
        return [];
    }
};

exports.getPullRequests = function(jobId) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           var prs = bobber.getPullRequests(workspace, jobConfig.scm, 'head');
           return prs;
       } else {
           return [];
       }
    } else {
        return [];
    }
};

exports.getOpenPullRequests = function(jobId, cb) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           bobber.getOpenPullRequests(jobConfig.scm, function (prs) {

              return cb(prs);
           });
       } else {
           return cb([]);
       }
    } else {
        return cb([]);
    }
};
