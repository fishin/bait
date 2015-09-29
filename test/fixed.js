var Code = require('code');
var Lab = require('lab');

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

describe('fixed', function () {

    it('createJob', function (done) {

        // switching this to pail later
        var config = {
            name: 'fixed',
            body: [
                'invalid'
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

            var runs = bait.getRuns(jobId, null);
            var runId = runs[0].id;
            var run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('getRun failed', function (done) {

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
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                done();
            }
        }, 1000);
    });

    it('updateJob', function (done) {

        var config = {
            body: [
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.updateJob(jobId, config, function (updateJob) {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.exist();
            expect(updateJob.body[0]).to.equal('date');
            done();
        });
    });

    it('startJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId, null, function () {

            var runs = bait.getRuns(jobId, null);
            var runId = runs[0].id;
            var run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(2);
            done();
        });
    });

    it('getRun fixed', function (done) {

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
                expect(run.status).to.equal('fixed');
                expect(run.id).to.exist();
                done();
            }
        }, 1000);
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
});
