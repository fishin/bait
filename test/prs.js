var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');
var Mock = require('mock');
var Pail = require('pail');

var Bait = require('../lib/index');

var internals = {
    defaults: {
        dirPath: '/tmp/testbait',
        mock: true
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
            name: 'mock',
            scm: {
                type: 'git',
                url: 'https://github.com/org/repo',
                branch: 'master'
            }
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('getPullRequests scm', function (done) {

        var type = 'github';
        var routes = [
            {
                method: 'get',
                path: '/repos/org/repo/pulls',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/rate_limit',
                file: 'anonymous.json'
            }
        ];
        Mock.prepareServer(type, routes, function(server) {

            server.start(function() {

                //console.log(server.info);
                var bait = new Bait({ dirPath: '/tmp/testbait', github: { url: server.info.uri } });
                var jobs = bait.getJobs();
                var jobId = jobs[0].id;
                bait.getPullRequests(jobId, null, function(prs) {

                    //console.log(prs);
                   expect(prs.length).to.be.above(0);
                   done();
                });
            });
        });
    });

    it('getPullRequest scm', function (done) {

        var type = 'github';
        var routes = [
            {
                method: 'get',
                path: '/repos/org/repo/pulls/1',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/rate_limit',
                file: 'anonymous.json'
            }
        ];
        Mock.prepareServer(type, routes, function(server) {

            server.start(function() {

                //console.log(server.info);
                var bait = new Bait({ dirPath: '/tmp/testbait', github: { url: server.info.uri } });
                var jobs = bait.getJobs();
                var jobId = jobs[0].id;
                var number = 1;
                bait.getPullRequest(jobId, number, null, function(pr) {

                    expect(pr.number).to.equal(1);
                    expect(pr.title).to.equal('mock pr');
                    expect(pr.commit.length).to.equal(40);
                    expect(pr.mergeCommit.length).to.equal(40);
                    expect(pr.shortCommit.length).to.equal(7);
                    expect(pr.repoUrl).to.equal('https://github.com/org/repo');
                    done();
                });
            });
        });
    });

    it('mergePullRequest scm', function (done) {

        var type = 'github';
        var routes = [
            {
                method: 'put',
                path: '/repos/org/repo/pulls/1/merge',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/rate_limit',
                file: 'authorized.json'
            }
        ];
        Mock.prepareServer(type, routes, function(server) {

            server.start(function() {

                //console.log(server.info);
                var bait = new Bait({ dirPath: '/tmp/testbait', github: { url: server.info.uri } });
                var jobs = bait.getJobs();
                var jobId = jobs[0].id;
                var number = 1;
                var token = 1;
                bait.mergePullRequest(jobId, number, token, function(result) {

                    //console.log(result);
                    expect(result.sha.length).to.equal(40);
                    expect(result.merged).to.be.true();
                    expect(result.message).to.equal('Pull Request successfully merged');
                    done();
                });
            });
        });
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

    it('createJob', function (done) {

        // switching this to pail later
        var config = {
            name: 'mock'
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('getPullRequests', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, function(prs) {

           //console.log(prs);
           expect(prs.length).to.equal(0);
           done();
        });
    });

    it('getPullRequest', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var number = 0;
        bait.getPullRequest(jobId, number, null, function(pr) {

           //console.log(pr);
           expect(pr).to.not.exist();
           done();
        });
    });

    it('mergePullRequest', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var number = 0;
        bait.mergePullRequest(jobId, number, null, function(result) {

           //console.log(pr);
           expect(result).to.not.exist();
           done();
        });
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

    it('createJob', function (done) {

        // switching this to pail later
        var config = {
            name: 'pr',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master',
                runOnCommit: true
            },
            body: [ 'sleep 5' ]
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
        var pr = {
            number: 1
        };
        bait.startJob(jobId, pr);
        done();
    });

    it('getRunPids 1', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        var runs = bait.getRuns(jobId, pr);
        var runId = runs[0].id;
        var pids = bait.getRunPids(jobId, pr, runId);
        expect(pids.length).to.equal(1);
        done();
    });

    it('startJob should not result in extra run', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        var cmds = [ 'uptime' ];
        bait.startJob(jobId, pr);
        done();
    });

    it('getRuns', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        var runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        var runs = bait.getRuns(jobId, pr);
        var runId = runs[0].id;
        var intervalObj1 = setInterval(function() {

            var run = bait.getRun(jobId, pr, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj1);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('getRunPids 0', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        var runs = bait.getRuns(jobId, pr);
        var runId = runs[0].id;
        var pids = bait.getRunPids(jobId, pr, runId);
        expect(pids.length).to.equal(0);
        done();
    });

    it('deleteRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        var runs = bait.getRuns(jobId, pr);
        var runId = runs[0].id;
        bait.deleteRun(jobId, pr, runId);
        runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(0);
        done();
    });

    it('deletePullRequest', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
            number: 1
        };
        bait.deletePullRequest(jobId, pr.number);
        var runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(0);
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

    it('createJob cancel', function (done) {

        // switching this to pail later
        var config = {
            name: 'prcancel',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master',
                runOnCommit: true
            },
            body: [ 'sleep 5' ]
        };
        var bait = new Bait(internals.defaults);
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('startJob cancel', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
           number: 1
        };
        bait.startJob(jobId, pr);
        done();
    });

    it('cancelRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pr = {
           number: 1
        };
        var runs = bait.getRuns(jobId, pr);
        var runId = runs[0].id;
        bait.cancelRun(jobId, pr, runId);
        var intervalObj2 = setInterval(function() {

            var run = bait.getRun(jobId, pr, runId);
            if (run.finishTime) {
                clearInterval(intervalObj2);
                expect(run.id).to.exist();
                expect(run.status).to.equal('cancelled');
                expect(run.commands.length).to.equal(1);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[0].finishTime).to.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob cancel', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob real pr', function (done) {

        // switching this to pail later
        var config = {
            name: 'pr',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/demo',
                branch: 'master'
            },
            body: [ 'npm install', 'npm test' ]
        };
        var bait = new Bait({ dirPath: '/tmp/testbait', mock: false });
        var createJob = bait.createJob(config);
        expect(createJob.id).to.exist();
        done();
    });

    it('startJob real prs', function (done) {

        var bait = new Bait({ dirPath: '/tmp/testbait', mock: false });
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, function(prs) {

            bait.startJob(jobId, prs[0]);
            bait.startJob(jobId, prs[1]);
            done();
        });
    });

    it('getRun pr1', function (done) {

        var bait = new Bait({ dirPath: '/tmp/testbait', mock: false });
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, function(prs) {

            var runs = bait.getRuns(jobId, prs[0]);
            var runId = runs[0].id;
            var intervalObj3 = setInterval(function() {

                var run = bait.getRun(jobId, prs[0], runId);
                //console.log(run);
                if (run.finishTime) {
                    clearInterval(intervalObj3);
                    //console.log(run);
                    expect(run.status).to.equal('succeeded');
                    expect(run.id).to.exist();
                    expect(run.commands).to.be.length(2);
                    expect(run.commands[0].stdout).to.exist();
                    done();
                }
            }, 1000);
        });
    });

    it('getRun pr2', function (done) {

        var bait = new Bait({ dirPath: '/tmp/testbait', mock: false });
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, function(prs) {

            var runs = bait.getRuns(jobId, prs[1]);
            var runId = runs[0].id;
            var intervalObj4 = setInterval(function() {

                var run = bait.getRun(jobId, prs[1], runId);
                //console.log(run);
                if (run.finishTime) {
                    clearInterval(intervalObj4);
                    //console.log(run);
                    expect(run.status).to.equal('failed');
                    expect(run.id).to.exist();
                    expect(run.commands).to.be.length(2);
                    expect(run.commands[0].stdout).to.exist();
                    done();
                }
            }, 1000);
        });
    });

    it('deleteJob pr real', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
