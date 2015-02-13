var Bobber = require('bobber');
var Hoek = require('hoek');
var Pail = require('pail');

var Run = require('./run');

var internals = {};

module.exports = internals.Job = function (settings) {

    internals.Job.settings = settings;
    var run = new Run(settings);
    internals.Job.startRun = run.startRun;
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
           var bobber = new Bobber({});
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
   return pail;
};

exports.deleteJob = function (jobId) {

   var jobPail = new Pail(internals.Job.settings);
   jobPail.deletePail(jobId);
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
   // sort by createTime
   fullJobs.sort(function(a, b){

      return a.createTime-b.createTime;
   });
   return fullJobs;
};

exports.startJob = function (jobId) {

   console.log('starting job:  ' + jobId);
   //var result = internals.startRun(jobId);
   var result = internals.Job.startRun(jobId);
   return result;
};

exports.deleteWorkspace = function (jobId) {

   var pail = new Pail({ dirPath: internals.Job.settings.dirPath + '/' + jobId });
   pail.deleteDir(internals.Job.settings.workspace);
   return null;
};

exports.getWorkspaceArtifact = function (jobId, artifact) {

   var pail = new Pail({ dirPath: internals.Job.settings.dirPath + '/' + jobId });
   //console.log('getting artifact: ' + artifact);
   var contents = pail.getArtifact(internals.Job.settings.workspace, artifact);
   return contents;
};
