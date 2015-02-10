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

describe('prs', function () {    

    it('createJob scm', function (done) {

        // switching this to pail later
        var config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('startJob scm', function (done) {

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

    it('getRun scm', function (done) {

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
                expect(run.commit).to.be.length(40);
                done();
            } 
        }, 1000); 
    });

    it('getPullRequests scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var prs = bait.getPullRequests(jobId);
        //console.log(commits);
        expect(prs.length).to.be.above(0);
        done();
    });

    it('deleteJob scm', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});