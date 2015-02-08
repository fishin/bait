var Hoek = require('hoek');
var Job = require('./job');
var Test = require('./test');

var internals = {
    defaults: {
        workspace: 'workspace',
        archive: 'archive'
    }
};


module.exports = internals.Bait = function (options) {

    internals.Bait.settings = Hoek.applyToDefaults(internals.defaults, options);
    var test = new Test(internals.Bait.settings);
    this.getTestResult = test.getTestResult;
    var job = new Job(internals.Bait.settings);
    this.createRun = job.createRun;
    this.startJob = job.startJob;
    this.cancelRun = job.cancelRun;
    this.getRun = job.getRun;
    this.getRunByName = job.getRunByName;
    internals.Bait.getRunPids = job.getRunPids;
    this.getRunPids = job.getRunPids;
    this.getRuns = job.getRuns;
    this.deleteRun = job.deleteRun;
    this.getWorkspaceArtifact = job.getWorkspaceArtifact;
    this.getArchiveArtifact = job.getArchiveArtifact;
    this.getArchiveArtifacts = job.getArchiveArtifacts;
    this.archiveArtifacts = job.archiveArtifacts;
    this.deleteWorkspace = job.deleteWorkspace;
    this.createJob = job.createJob;
    this.deleteJob = job.deleteJob;
    this.updateJob = job.updateJob;
    this.getJob = job.getJob;
    this.getJobByName = job.getJobByName;
    this.getJobs = job.getJobs;
    this.getAllCommits = job.getAllCommits;
    this.getCompareCommits = job.getCompareCommits;
};
