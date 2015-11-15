'use strict';

const Hoek = require('hoek');
const Taut = require('taut');
const Job = require('./job');
const Run = require('./run');
const SCM = require('./scm');
const Test = require('./test');

const internals = {
    defaults: {
        workspace: 'workspace',
        archive: 'archive',
        queue: {
            size: 1
        },
        github: {
            url: 'https://api.github.com',
            token: null
        },
        notify: {
            plugins: {
                email: {
                    plugin: require('brag'),
                    options: {
                        from: 'donotreply@ficion.net',
                        subjectTag: 'ficion'
                    }
                }
            }
        },
        mock: false
    }
};

module.exports = internals.Bait = function (options) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);
    internals.Bait.settings = settings;
    const test = new Test(settings);
    this.getTestResult = test.getTestResult;
    const job = new Job(settings);
    this.getWorkspaceArtifact = job.getWorkspaceArtifact;
    this.deleteWorkspace = job.deleteWorkspace;
    this.createJob = job.createJob;
    this.deleteJob = job.deleteJob;
    this.updateJob = job.updateJob;
    this.getJob = job.getJob;
    this.getJobByName = job.getJobByName;
    this.getJobs = job.getJobs;
    this.startJob = job.startJob;
    const run = new Run(settings);
    this.createRun = run.createRun;
    this.cancelRun = run.cancelRun;
    this.getRun = run.getRun;
    this.getPreviousRun = run.getPreviousRun;
    this.getRunByName = run.getRunByName;
    internals.Bait.getRunPids = run.getRunPids;
    this.getRunPids = run.getRunPids;
    this.getRuns = run.getRuns;
    this.deleteRun = run.deleteRun;
    this.deleteRuns = run.deleteRuns;
    this.deletePullRequest = run.deletePullRequest;
    this.getArchiveArtifact = run.getArchiveArtifact;
    this.getArchiveArtifacts = run.getArchiveArtifacts;
    this.archiveArtifacts = run.archiveArtifacts;
    this.getActiveJobs = run.getActiveJobs;
    this.getActivePullRequests = run.getActivePullRequests;
    const scm = new SCM(internals.Bait.settings);
    this.getAllCommits = scm.getAllCommits;
    this.getCompareCommits = scm.getCompareCommits;
    this.getPullRequests = scm.getPullRequests;
    this.getPullRequest = scm.getPullRequest;
    this.mergePullRequest = scm.mergePullRequest;
    this.getLatestCommit = scm.getLatestCommit;
    this.getLatestRemoteCommit = scm.getLatestRemoteCommit;
    const tautOptions = {
        size: settings.queue.size,
        startJob: job.startJob,
        getJob: job.getJob,
        getActiveJobs: run.getActiveJobs,
        getActivePullRequests: run.getActivePullRequests
    };
    const queue = new Taut(tautOptions);
    this.addJob = queue.addJob;
    this.removeJob = queue.removeJob;
    this.getQueue = queue.getQueue;
    this.startQueue = queue.startQueue;
    this.stopQueue = queue.stopQueue;
    this.clearQueue = queue.clearQueue;
};
