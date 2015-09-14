var Code = require('code');
var Lab = require('lab');
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

describe('cancel', function () {

    it('createJob', function (done) {

        var config = {
            name: 'cancel',
            body: [
                'sleep 5',
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        bait.createJob(config, function (createJob) {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null, function () {

            var job = bait.getJob(jobId);
            var runs = bait.getRuns(jobId, null);
            var runId = runs[0].id;
            var run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('cancelRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        bait.cancelRun(jobId, null, runId);
        var intervalObj = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.status).to.equal('cancelled');
                expect(run.commands.length).to.equal(2);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[0].signal).to.equal('SIGTERM');
                expect(run.commands[1].startTime).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('getRunByName lastCancel', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var run = bait.getRunByName(jobId, 'lastCancel');
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(run.finishTime).to.exist();
        expect(run.status).to.equal('cancelled');
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

    it('createJob npm', function (done) {

        var config = {
            name: 'npm',
            body: [
                'npm install',
                'uptime'
            ]
        };
        var bait = new Bait(internals.defaults);
        bait.createJob(config, function (createJob) {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob npm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null, function () {

            var job = bait.getJob(jobId);
            var runs = bait.getRuns(jobId, null);
            var runId = runs[0].id;
            var run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('cancelRun npm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        bait.cancelRun(jobId, null, runId);
        var intervalObj = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.status).to.equal('cancelled');
                expect(run.commands.length).to.equal(2);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[0].signal).to.equal('SIGTERM');
                expect(run.commands[1].startTime).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob npm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
