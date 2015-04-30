var Hoek = require('hoek');
var Job = require('./job');
var Queue = require('./queue');
var Run = require('./run');
var SCM = require('./scm');
var Test = require('./test');

var internals = {
    defaults: {
        workspace: 'workspace',
        archive: 'archive',
        github: {
            url: 'https://api.github.com'
        },
        mock: false
    }
};

module.exports = internals.Bait = function (options) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    internals.Bait.settings = settings;
    var queue = new Queue(settings);
    this.addJob = queue.addJob;
    this.removeJob = queue.removeJob;
    this.getQueue = queue.getQueue;
    this.startQueue = queue.startQueue;
    this.stopQueue = queue.stopQueue;
    var test = new Test(settings);
    this.getTestResult = test.getTestResult;
    var job = new Job(settings);
    this.getWorkspaceArtifact = job.getWorkspaceArtifact;
    this.deleteWorkspace = job.deleteWorkspace;
    this.createJob = job.createJob;
    this.deleteJob = job.deleteJob;
    this.updateJob = job.updateJob;
    this.getJob = job.getJob;
    this.getJobByName = job.getJobByName;
    this.getJobs = job.getJobs;
    this.startJob = job.startJob;
    var run = new Run(settings);
    this.createRun = run.createRun;
    this.cancelRun = run.cancelRun;
    this.getRun = run.getRun;
    this.getRunByName = run.getRunByName;
    internals.Bait.getRunPids = run.getRunPids;
    this.getRunPids = run.getRunPids;
    this.getRuns = run.getRuns;
    this.deleteRun = run.deleteRun;
    this.deletePullRequest = run.deletePullRequest;
    this.getArchiveArtifact = run.getArchiveArtifact;
    this.getArchiveArtifacts = run.getArchiveArtifacts;
    this.archiveArtifacts = run.archiveArtifacts;
    this.getActiveJobs = run.getActiveJobs;
    this.getActivePullRequests = run.getActivePullRequests;
    var scm = new SCM(internals.Bait.settings);
    this.getAllCommits = scm.getAllCommits;
    this.getCompareCommits = scm.getCompareCommits;
    this.getPullRequests = scm.getPullRequests;
    this.getPullRequest = scm.getPullRequest;
    this.mergePullRequest = scm.mergePullRequest;
    this.getLatestCommit = scm.getLatestCommit;
    this.getLatestRemoteCommit = scm.getLatestRemoteCommit;
};
