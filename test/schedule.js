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

describe('schedule', function () {

    it('createJob job', function (done) {

        // switching this to pail later
        var config = {
            name: 'job',
            body: [ 'date' ],
            schedule: {
                type: 'cron',
                pattern: '*/5 * * * *'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        expect(createJob.schedule.pattern).to.equal('*/5 * * * *');
        done();
    });

    it('updateJob job', function (done) {

        var config = {
            schedule: {
                pattern: '*/10 * * * *'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        expect(updateJob.schedule.pattern).to.equal('*/10 * * * *');
        done();
    });

    it('deleteJob job', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
