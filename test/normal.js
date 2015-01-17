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

    it('createJob', function (done) {

        var config = {
            name: 'parallelcommand',
            cmds: [
                'git clone --branch=master https://github.com/fishin/bait .',
                'npm install',
                'bin/test.sh',
                [ 'uptime', 'npm list', 'ls -altr' ],
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('createJob date', function (done) {

        var config = {
            cmds: [
                'date'
            ]
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

    it('updateJob', function (done) {

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

    it('getJobByName', function (done) {

        var bait = new Bait(internals.defaults);
        var job = bait.getJobByName('parallelcommand');
        expect(job.id).to.exist();
        expect(job.name).to.equal('parallelcommand');
        done();
    });

    it('startJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId);
        var job = bait.getJob(jobId);
        var runs = bait.getRuns(jobId);
        var runId = runs[0];
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
        var runId = runs[0];
        var pids = bait.getRunPids(runId);
        expect(pids.length).to.equal(1);
        done();
    });

    it('getRun finish', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0];
        var intervalObj = setInterval(function() {
            var run = bait.getRun(jobId, runId);
            if (run.finishTime) {
                clearInterval(intervalObj); 
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(7);
                expect(run.commands[2].stdout).to.equal('mmm bait\n');
                done();
            } 
        }, 1000); 
    });

    it('getRunPids 0', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId);
        var runId = runs[0];
        var pids = bait.getRunPids(runId);
        expect(pids.length).to.equal(0);
        done();
    });

    it('getWorkspaceArtifact', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var contents = bait.getWorkspaceArtifact(jobId, 'bin/test.sh');
        expect(contents).to.contain('mmm bait');
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
        var runs = bait.getRuns(jobId);
        var runId = runs[0];
        bait.deleteRun(jobId, runId);
        var deleteRuns = bait.getRuns(jobId);
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
        expect(jobs.length).to.equal(1);
        done();
    });

    it('deleteJob date', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
