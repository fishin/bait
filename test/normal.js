var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');
var Pail = require('pail');

var Bait = require('../lib/index');

var internals = {
    defaults: {
        dirPath: '/tmp/testbait'
    }
};

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

describe('normal', function () {    

    it('createJob scm', function (done) {

        var config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master'
            },
            archive: {
                pattern: 'lab.json'
            },
            body: [
                'npm install',
                'npm run-script json',
                [ 'uptime', 'npm list', 'ls -altr' ],
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('createJob noscm', function (done) {

        var config = {
            name: 'noscm',
            head: [ 'date' ],
            body: [ 'uptime' ],
            tail: [ 'cat /etc/hosts' ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('getJobs', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        expect(jobs.length).to.equal(2);
        done();
    });

    it('updateJob scm', function (done) {

        var config = {
            description: 'desc'
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        expect(updateJob.updateTime).to.exist();
        expect(updateJob.description).to.equal('desc');
        done();
    });

    it('getJobByName scm', function (done) {

        var bait = new Bait(internals.defaults);
        var job = bait.getJobByName('scm');
        expect(job.id).to.exist();
        expect(job.name).to.equal('scm');
        done();
    });

    it('startJob scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var run = bait.getRun(jobId, runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(runs.length).to.equal(1);
        done();
    });

    it('startJob noscm 1', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        bait.startJob(jobId);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var run = bait.getRun(jobId, runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRunPids 1', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var pids = bait.getRunPids(jobId, runId);
        expect(pids.length).to.equal(1);
        done();
    });

    it('getRun scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var intervalObj = setInterval(function() {
            var run = bait.getRun(jobId, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj); 
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(8);
                expect(run.commands[3].stdout).to.exist();
                done();
            } 
        }, 1000); 
    });

    it('getRun noscm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var intervalObj = setInterval(function() {
            var run = bait.getRun(jobId, runId);
            if (run.finishTime) {
                clearInterval(intervalObj); 
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(3);
                done();
            } 
        }, 1000); 
    });

    it('startJob noscm 2', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        bait.startJob(jobId);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var run = bait.getRun(jobId, runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(runs.length).to.equal(2);
        done();
    });

    it('getRun noscm 2', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var intervalObj = setInterval(function() {
            var run = bait.getRun(jobId, runId);
            if (run.finishTime) {
                clearInterval(intervalObj); 
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(3);
                done();
            } 
        }, 1000); 
    });

    it('getRunPids 0', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var pids = bait.getRunPids(jobId, runId);
        expect(pids.length).to.equal(0);
        done();
    });

    it('getCommits scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.getCommits(jobId, function(commits) {

            //console.log(commits);
            expect(commits.length).to.be.above(0);
            done();
        });
    });

    it('getCommits noscm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        bait.getCommits(jobId, function(commits) {

            //console.log(commits);
            expect(commits.length).to.be.equal(0);
            done();
        });
    });

    it('getWorkspaceArtifact scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var contents = bait.getWorkspaceArtifact(jobId, 'lab.json');
        expect(contents).to.contain('test');
        done();
    });

    it('getArchiveArtifact scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var contents = bait.getArchiveArtifact(jobId, runId, 'lab.json');
        expect(contents).to.contain('test');
        done();
    });

    it('getTestResult scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var result = bait.getTestResult(jobId, runId, 'lab.json');
        console.log(result);
        expect(result.totalTests).to.exist();
        expect(result.tests).to.exist();
        expect(result.coveragePercent).to.exist();
        expect(result.coverage).to.exist();
        expect(result.totalDuration).to.exist();
        expect(result.totalLeaks).to.exist();
        done();
    });

    it('getArchiveArtifacts scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        var files = bait.getArchiveArtifacts(jobId, runId);
        expect(files[0]).to.equal('lab.json');
        done();
    });

    it('getRunByName last scm', function (done) {

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

    it('deleteRun scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0].id;
        bait.deleteRun(jobId, runId);
        var deleteRuns = bait.getRuns(jobId);
        expect(deleteRuns.length).to.equal(0);
        done();
    });

    it('deleteWorkspace scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteWorkspace(jobId);
        done();
    });

    it('deleteJob scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
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
