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

/*

describe('scheduler', function () {    

    it('initializeScheduler empty', function (done) {

        var bait = new Bait(internals.defaults);
        bait.initializeScheduler();
        var schedules = bait.getSchedules();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('getSchedule invalid', function (done) {

        var bait = new Bait(internals.defaults);
        var schedule = bait.getSchedule('none');
        expect(schedule).to.not.exist();
        done();
    });

    it('createJob noschedule', function (done) {

        var config = {
            name: 'schedule',
            body: [ 'uptime' ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('initializeScheduler noschedule', function (done) {

        var bait = new Bait(internals.defaults);
        bait.initializeScheduler();
        var schedules = bait.getSchedules();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('deleteJob noschedule', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob', function (done) {

        var config = {
            name: 'schedule',
            body: [ 'uptime' ],
            schedule: {
                type: 'cron',
                pattern: '* * * * * *'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        var intervalObj = setInterval(function() {
             console.log('sleeping for 10s'); 
        }, 10000);
    });

    it('removeScheduler', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.removeSchedule(jobId);
        var schedules = bait.getSchedules();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('initializeScheduler', function (done) {

        var bait = new Bait(internals.defaults);
        bait.initializeScheduler();
        var schedules = bait.getSchedules();
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        //console.log(schedules);
        expect(schedules.length).to.equal(1);
        expect(schedules[0].jobId).to.equal(jobId);
        done();
    });

    it('updateJob', function (done) {

        var config = {
            schedule: {
                type: 'none'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        done();
    });

    it('initializeScheduler none', function (done) {

        var bait = new Bait(internals.defaults);
        bait.initializeScheduler();
        var schedules = bait.getSchedules();
        expect(schedules.length).to.equal(0);
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
});

*/
