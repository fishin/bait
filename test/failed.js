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

describe('failed', function () {    

    it('createJob', function (done) {


        var config = {
            name: 'bad',
            cmds: [
                'date',
                'uptime',
                [ 'ls -altr', 'npm test', 'ls -altr' ],
                'cat /etc/hosts'
            ]
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
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(4);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[3].stderr).to.exist();
                expect(run.commands[3].code).to.exist();
                done();
            } 
        }, 1000); 
    });

    it('getRunByName lastFail', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var run = bait.getRunByName(jobId, 'lastFail');
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(run.finishTime).to.exist();
        expect(run.status).to.equal('failed');
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
