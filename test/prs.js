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
});
