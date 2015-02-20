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
    this.getPullRequest = exports.getPullRequest;
    this.mergePullRequest = exports.mergePullRequest;
    this.getLatestCommit = exports.getLatestCommit;
    this.getLatestRemoteCommit = exports.getLatestRemoteCommit;
};

exports.getAllCommits = function(jobId) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           var commits = bobber.getAllCommits(workspace);
           return commits;
//       } else {
//           return [];
//       }
    } else {
        return [];
    }
};

exports.getLatestCommit = function(jobId) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           var commit = bobber.getLatestCommit(workspace);
           return commit;
//       } else {
//           return null;
//       }
    } else {
        return null;
    }
};

exports.getLatestRemoteCommit = function(jobId) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var commit = bobber.getLatestRemoteCommit(jobConfig.scm);
           return commit;
//       } else {
//           return null;
//       }
    } else {
        return null;
    }
};

exports.getCompareCommits = function(jobId, startCommit, endCommit) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           var commits = bobber.getCompareCommits(workspace, startCommit, endCommit);
           return commits;
//       } else {
//           return [];
//       }
    } else {
        return [];
    }
};

exports.getPullRequests = function(jobId, token, cb) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           bobber.getPullRequests(jobConfig.scm, token, function (prs) {

              return cb(prs);
           });
//       } else {
//           return cb([]);
//       }
    } else {
        return cb([]);
    }
};

exports.getPullRequest = function(jobId, number, token, cb) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           bobber.getPullRequest(jobConfig.scm, number, token, function (pr) {

              return cb(pr);
           });
//       } else {
//           return cb([]);
//       }
    } else {
        return cb(null);
    }
};

exports.mergePullRequest = function(jobId, number, token, cb) {
  
    var jobConfig = internals.SCM.getJob(jobId);
    if (jobConfig.scm) {
       // need some logic to implement scm type but for now lets just assume git
//       if (jobConfig.scm.type === 'git') {
           var bobber = new Bobber({});
           var workspace = internals.SCM.settings.dirPath + '/' + jobId + '/' + internals.SCM.settings.workspace;
           bobber.mergePullRequest(jobConfig.scm, number, token, function (result) {

              return cb(result);
           });
//       } else {
//           return cb([]);
//       }
    } else {
        return cb(null);
    }
};
