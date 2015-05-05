var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');
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

describe('notify', function () {

    it('createJob', function (done) {

        // switching this to pail later
        var config = {
            name: 'notify',
            body: [
                'invalid'
            ],
            notify: {
                type: 'email',
                to: 'lloyd.benson@gmail.com',
                subject: 'subject',
                message: 'message'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
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
        var intervalObj = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].stdout).to.exist();
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
