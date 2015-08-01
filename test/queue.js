var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var Bait = require('../lib/index');

var internals = {
    defaults: {
        dirPath: __dirname + '/tmp'
    }
};

describe('queue', function () {

    it('startQueue and stopQueue', function (done) {

        var bait = new Bait({});
        var queueObj = bait.startQueue();
        setTimeout(function () {

            bait.stopQueue(queueObj);
            done();
        }, 1000);
    });

    it('getQueue', function (done) {

        var bait = new Bait({});
        var queue = bait.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('addJob 1', function (done) {

        var bait = new Bait({});
        var jobId = '12345678-1234-1234-1234-123456789012';
        bait.addJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 1 again', function (done) {

        var bait = new Bait({});
        var jobId = '12345678-1234-1234-1234-123456789012';
        bait.addJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('addJob 2', function (done) {

        var bait = new Bait({});
        var jobId = '12345678-1234-1234-1234-123456789013';
        bait.addJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(2);
        done();
    });

    it('removeJob 2', function (done) {

        var bait = new Bait({});
        var jobId = '12345678-1234-1234-1234-123456789013';
        bait.removeJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(1);
        done();
    });

    it('removeJob 1', function (done) {

        var bait = new Bait({});
        var jobId = '12345678-1234-1234-1234-123456789012';
        bait.removeJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(0);
        done();
    });

    it('createJob', function (done) {

        var config = {
            name: 'queue',
            body: [
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('startJob from queue', function (done) {

        var bait = new Bait(internals.defaults);
        var queueObj = bait.startQueue();
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.addJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(1);
        setTimeout(function () {

            queue = bait.getQueue();
            expect(queue.length).to.equal(0);
            bait.stopQueue(queueObj);
            done();
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

    it('createJob sleep', function (done) {

        var config = {
            name: 'queue',
            body: [
                'sleep 2'
            ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('addJob for startJob', function (done) {

        var bait = new Bait(internals.defaults);
        var queueObj = bait.startQueue();
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.startJob(jobId);
        var runs = bait.getRuns(jobId, null);
        var runId = runs[0].id;
        bait.addJob(jobId);
        var queue = bait.getQueue();
        expect(queue.length).to.equal(1);
        var intervalObj2 = setInterval(function () {

            var run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj2);
                bait.stopQueue(queueObj);
                done();
            }
        }, 1000);
    });

    it('deleteJob sleep', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
