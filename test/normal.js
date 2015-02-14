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

    it('createJob job1', function (done) {

        // switching this to pail later
        var config = {
            name: 'job1',
            body: [
                [ 'uptime', 'sleep 2' ],
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('createJob job2', function (done) {

        var config = {
            name: 'job2',
            head: [ 'date' ],
            body: [ 'uptime' ],
            tail: [ 'cat /etc/hosts' ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('updateJob job2', function (done) {

        var config = {
            description: 'desc'
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        expect(updateJob.updateTime).to.exist();
        expect(updateJob.description).to.equal('desc');
        done();
    });

    it('getJobs', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        expect(jobs.length).to.equal(2);
        done();
    });

    it('getJobByName job1', function (done) {

        var bait = new Bait(internals.defaults);
        var job = bait.getJobByName('job1');
        expect(job.id).to.exist();
        expect(job.name).to.equal('job1');
        done();
    });

    it('startJob job1', function (done) {

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

    it('startJob job2 1', function (done) {

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

    it('getRun job1', function (done) {

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
                expect(run.commands).to.be.length(3);
                expect(run.commands[2].stdout).to.exist();
                done();
            } 
        }, 1000); 
    });

    it('getRun job2', function (done) {

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

    it('startJob job2 2', function (done) {

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

    it('getRun job2 2', function (done) {

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

    it('getAllCommits job2', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[1].id;
        var commits = bait.getAllCommits(jobId);
        //console.log(commits);
        expect(commits.length).to.be.equal(0);
        done();
    });

    it('deleteJob job1', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        done();
    });

    it('deleteJob job2', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
