var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');
var Mock = require('mock');
var Pail = require('pail');

var Bait = require('../lib/index');

var internals = {
    defaults: {
        dirPath: __dirname + '/tmp'
    }
};

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

describe('scm', function () {

    it('createJob', function (done) {

        var config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bait',
                branch: 'master'
            },
            archive: {
                pattern: 'lab.json'
            },
            body: [
                'npm install',
                'npm test',
                ['uptime', 'npm list', 'ls -altr'],
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        expect(createJob.scm.url).to.equal('https://github.com/fishin/bait');
        done();
    });

    it('updateJob scm', function (done) {

        var config = {
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        expect(updateJob.updateTime).to.exist();
        expect(updateJob.scm.url).to.equal('https://github.com/fishin/pail');
        done();
    });

    it('startJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var run = bait.getRun(jobId, null, runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var intervalObj1 = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj1);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commit).to.be.length(40);
                expect(run.commands).to.be.length(6);
                expect(run.commands[3].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('getLatestCommit', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var commit = bait.getLatestCommit(jobId);
        expect(commit).to.be.length(40);
        done();
    });

    it('getLatestRemoteCommit', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var commit = bait.getLatestRemoteCommit(jobId);
        expect(commit).to.be.length(40);
        done();
    });

    it('getAllCommits', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var commits = bait.getAllCommits(jobId);
        //console.log(commits);
        expect(commits.length).to.be.above(0);
        done();
    });

    it('getCompareCommits', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var commits = bait.getAllCommits(jobId);
        var compareCommits = bait.getCompareCommits(jobId, commits[0].commit, commits[1].commit);
        //console.log(commits);
        expect(compareCommits.length).to.be.above(0);
        done();
    });

    it('getWorkspaceArtifact', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var contents = bait.getWorkspaceArtifact(jobId, 'lab.json');
        expect(contents).to.contain('test');
        done();
    });

    it('getArchiveArtifact', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var contents = bait.getArchiveArtifact(jobId, runId, 'lab.json');
        expect(contents).to.contain('test');
        done();
    });

    it('getTestResult', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var result = bait.getTestResult(jobId, runId, 'lab.json');
        //console.log(result);
        expect(result.totalTests).to.exist();
        expect(result.tests).to.exist();
        expect(result.coveragePercent).to.exist();
        expect(result.coverage).to.exist();
        expect(result.totalDuration).to.exist();
        expect(result.totalLeaks).to.exist();
        done();
    });

    it('getArchiveArtifacts', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var files = bait.getArchiveArtifacts(jobId, runId);
        expect(files[0]).to.equal('lab.json');
        done();
    });

    it('getRunByName last', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var run = bait.getRunByName(jobId, 'last');
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(run.finishTime).to.exist();
        expect(run.status).to.equal('succeeded');
        done();
    });

    it('deleteRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        bait.deleteRun(jobId, null, runId);
        var deleteRuns = bait.getRuns(jobId, null);
        expect(deleteRuns.length).to.equal(0);
        done();
    });

    it('deleteWorkspace', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteWorkspace(jobId);
        done();
    });

    it('deleteJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob runOnCommit', function (done) {

        // switching this to pail later
        var config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master',
                runOnCommit: true
            },
            body: [
                'npm install',
                'npm test'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        expect(createJob.scm.url).to.equal('https://github.com/fishin/pail');
        done();
    });

    it('startJob runOnCommit 1', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun runOnCommit 1', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var intervalObj2 = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj2);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commit).to.be.length(40);
                expect(run.commands).to.be.length(2);
                expect(run.commands[1].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('startJob runOnCommit 2', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        done();
    });

    it('deleteJob runOnCommit', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob fail', function (done) {

        var config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master1'
            },
            body: [
                'npm install',
                'npm test'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        expect(createJob.scm.url).to.equal('https://github.com/fishin/pail');
        done();
    });

    it('startJob fail', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var run = bait.getRun(jobId, null, runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun fail', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var intervalObj3 = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj3);
                //console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(2);
                expect(run.commands[1].stdout).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob fail', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob no body', function (done) {

        // switching this to pail later
        var config = {
            name: 'prs',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('startJob no body', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var run = bait.getRun(jobId, null, runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun no body', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var intervalObj = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commit).to.be.length(40);
                done();
            }
        }, 1000);
    });

    it('deleteJob nobody', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob noscm', function (done) {

        var config = {
            name: 'noscm',
            scm: {
                type: 'none'
            },
            body: ['uptime']
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        expect(createJob.body[0]).to.equal('uptime');
        expect(createJob.scm.type).to.equal('none');
        done();
    });

    it('updateJob noscm', function (done) {

        var config = {
            scm: {
                type: 'none',
                url: 'https://github.com/fishin/pail',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.scm.type).to.equal('none');
        expect(updateJob.id).to.exist();
        expect(updateJob.updateTime).to.exist();
        expect(updateJob.body[0]).to.equal('uptime');
        expect(updateJob.scm.branch).to.equal('master');
        expect(updateJob.scm.url).to.equal('https://github.com/fishin/pail');
        done();
    });

    it('deleteJob noscm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
