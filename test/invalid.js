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

describe('invalid', function () {

    it('getRun', function (done) {

        var bait = new Bait(internals.defaults);
        var run = bait.getRun('invalid', null, 'invalid');
        expect(run).to.not.exist();
        done();
    });

    it('createJob cmd', function (done) {

        var config = {
            name: 'invalid',
            body: [
                'invalid'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('updateJob cmd scm https', function (done) {

        var config = {
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/invalid',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        expect(updateJob.updateTime).to.not.exist();
        expect(updateJob.scm).to.not.exist();
        done();
    });

    it('updateJob cmd scm type', function (done) {

        var config = {
            scm: {
                type: 'invalid'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        expect(updateJob.updateTime).to.not.exist();
        expect(updateJob.scm).to.not.exist();
        done();
    });

    it('startJob cmd', function (done) {

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

    it('getRun cmd', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        var intervalObj = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].error).to.exist();
                expect(run.finishTime).to.exist();
                expect(run.finishTime).to.be.above(run.startTime);
                done();
            }
        }, 1000);
    });

    it('deleteJob cmd', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob scm type', function (done) {

        var config = {
            name: 'invalid',
            scm: {
                type: 'invalid'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.not.exist();
        expect(createJob.message).to.exist();
        done();
    });

    it('createJob scm http', function (done) {

        var config = {
            name: 'http',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/invalid',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.not.exist();
        expect(createJob.message).to.exist();
        done();
    });

});
