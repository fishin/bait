'use strict';

const Code = require('code');
const Lab = require('lab');
const Mock = require('mock');

const Bait = require('../lib/index');

const internals = {
    defaults: {
        dirPath: __dirname + '/tmp',
        mock: true
    }
};

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('prs', () => {

    it('createJob scm', (done) => {

        const config = {
            name: 'mock',
            scm: {
                type: 'git',
                url: 'https://github.com/org/repo',
                branch: 'master'
            }
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('getPullRequests scm', (done) => {

        const type = 'github';
        const routes = [
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
        Mock.prepareServer(type, routes, (server) => {

            server.start(() => {

                //console.log(server.info);
                const bait = new Bait({ dirPath: internals.defaults.dirPath, github: { url: server.info.uri } });
                const jobs = bait.getJobs();
                const jobId = jobs[0].id;
                bait.getPullRequests(jobId, null, (prs) => {

                    //console.log(prs);
                    expect(prs.length).to.be.above(0);
                    done();
                });
            });
        });
    });

    it('getPullRequest scm', (done) => {

        const type = 'github';
        const routes = [
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
        Mock.prepareServer(type, routes, (server) => {

            server.start(() => {

                //console.log(server.info);
                const bait = new Bait({ dirPath: internals.defaults.dirPath, github: { url: server.info.uri } });
                const jobs = bait.getJobs();
                const jobId = jobs[0].id;
                const number = 1;
                bait.getPullRequest(jobId, number, null, (pr) => {

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

    it('mergePullRequest scm', (done) => {

        const type = 'github';
        const routes = [
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
        Mock.prepareServer(type, routes, (server) => {

            server.start(() => {

                //console.log(server.info);
                const bait = new Bait({ dirPath: internals.defaults.dirPath, github: { url: server.info.uri } });
                const jobs = bait.getJobs();
                const jobId = jobs[0].id;
                const number = 1;
                const token = 1;
                bait.mergePullRequest(jobId, number, token, (result) => {

                    //console.log(result);
                    expect(result.sha.length).to.equal(40);
                    expect(result.merged).to.be.true();
                    expect(result.message).to.equal('Pull Request successfully merged');
                    done();
                });
            });
        });
    });

    it('deleteJob scm', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob', (done) => {

        // switching this to pail later
        const config = {
            name: 'mock'
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('getPullRequests', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, (prs) => {

            //console.log(prs);
            expect(prs.length).to.equal(0);
            done();
        });
    });

    it('getPullRequest', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const number = 0;
        bait.getPullRequest(jobId, number, null, (pr) => {

            //console.log(pr);
            expect(pr).to.not.exist();
            done();
        });
    });

    it('mergePullRequest', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const number = 0;
        bait.mergePullRequest(jobId, number, null, (result) => {

            //console.log(pr);
            expect(result).to.not.exist();
            done();
        });
    });

    it('deleteJob', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob', (done) => {

        // switching this to pail later
        const config = {
            name: 'pr',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master',
                runOnCommit: true
            },
            body: ['sleep 5']
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        bait.startJob(jobId, pr, () => {

            done();
        });
    });

    it('getRunPids 1', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        const runs = bait.getRuns(jobId, pr);
        const runId = runs[0].id;
        const pids = bait.getRunPids(jobId, pr, runId);
        expect(pids.length).to.equal(1);
        done();
    });

    it('startJob should not result in extra run', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        bait.startJob(jobId, pr, () => {

            done();
        });
    });

    it('getRuns', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        const runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        const runs = bait.getRuns(jobId, pr);
        const runId = runs[0].id;
        const intervalObj1 = setInterval(() => {

            const run = bait.getRun(jobId, pr, runId);
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

    it('getRunPids 0', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        const runs = bait.getRuns(jobId, pr);
        const runId = runs[0].id;
        const pids = bait.getRunPids(jobId, pr, runId);
        expect(pids.length).to.equal(0);
        done();
    });

    it('deleteRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        let runs = bait.getRuns(jobId, pr);
        const runId = runs[0].id;
        bait.deleteRun(jobId, pr, runId);
        runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(0);
        done();
    });

    it('deleteRuns', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        let runs = bait.getRuns(jobId, pr);
        bait.deleteRuns(jobId, pr);
        runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(0);
        done();
    });

    it('deletePullRequest', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        bait.deletePullRequest(jobId, pr.number);
        const runs = bait.getRuns(jobId, pr);
        expect(runs.length).to.equal(0);
        done();
    });

    it('deleteJob', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob cancel', (done) => {

        // switching this to pail later
        const config = {
            name: 'prcancel',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master',
                runOnCommit: true
            },
            body: ['sleep 5']
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob cancel', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        bait.startJob(jobId, pr, () => {

            done();
        });
    });

    it('cancelRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pr = {
            number: 1
        };
        const runs = bait.getRuns(jobId, pr);
        const runId = runs[0].id;
        bait.cancelRun(jobId, pr, runId);
        const intervalObj2 = setInterval(() => {

            const run = bait.getRun(jobId, pr, runId);
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

    it('deleteJob cancel', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob real pr', (done) => {

        // switching this to pail later
        const config = {
            name: 'pr',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/demo',
                branch: 'master'
            },
            body: ['npm install', 'npm test']
        };
        const bait = new Bait({ dirPath: internals.defaults.dirPath, mock: false });
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob real prs', (done) => {

        const bait = new Bait({ dirPath: internals.defaults.dirPath, mock: false });
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, (prs) => {

            bait.startJob(jobId, prs[0], () => {

                bait.startJob(jobId, prs[1], () => {

                    done();
                });
            });
        });
    });

    it('getRun pr1', (done) => {

        const bait = new Bait({ dirPath: internals.defaults.dirPath, mock: false });
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, (prs) => {

            const runs = bait.getRuns(jobId, prs[0]);
            const runId = runs[0].id;
            const intervalObj3 = setInterval(() => {

                const run = bait.getRun(jobId, prs[0], runId);
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

    it('getRun pr2', (done) => {

        const bait = new Bait({ dirPath: internals.defaults.dirPath, mock: false });
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getPullRequests(jobId, null, (prs) => {

            const runs = bait.getRuns(jobId, prs[1]);
            const runId = runs[0].id;
            const intervalObj4 = setInterval(() => {

                const run = bait.getRun(jobId, prs[1], runId);
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

    it('deleteJob pr real', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
