'use strict';

const Code = require('code');
const Lab = require('lab');

const Bait = require('../lib/index');

const internals = {
    defaults: {
        dirPath: __dirname + '/tmp'
    }
};

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('scm', () => {

    it('createJob', (done) => {

        const config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bait',
                branch: 'master'
            },
            archive: {
                pattern: 'test.lab'
            },
            body: [
                'npm install',
                'npm test',
                ['uptime', 'npm list', 'ls -altr'],
                'date'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            expect(createJob.scm.url).to.equal('https://github.com/fishin/bait');
            done();
        });
    });

    it('updateJob scm', (done) => {

        const config = {
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master'
            }
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.exist();
            expect(updateJob.scm.url).to.equal('https://github.com/fishin/pail');
            done();
        });
    });

    it('startJob', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            const runId = runs[0].id;
            const run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('getRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj1 = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj1);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commit).to.be.length(40);
                expect(run.commands).to.be.length(6);
                expect(run.commands[3].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('getLatestCommit', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getLatestCommit(jobId, (commit) => {


            expect(commit).to.be.length(40);
            done();
        });
    });

    it('getLatestRemoteCommit', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getLatestRemoteCommit(jobId, (commit) => {

            expect(commit).to.be.length(40);
            done();
        });
    });

    it('getAllCommits', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getAllCommits(jobId, (commits) => {

            //console.log(commits);
            expect(commits.length).to.be.above(0);
            done();
        });
    });

    it('getCompareCommits', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.getAllCommits(jobId, (commits) => {

            bait.getCompareCommits(jobId, commits[0].commit, commits[1].commit, (compareCommits) => {

                //console.log(compareCommits);
                expect(compareCommits.length).to.be.above(0);
                done();
            });
        });
    });

    it('getWorkspaceArtifact', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const contents = bait.getWorkspaceArtifact(jobId, 'test.lab');
        expect(contents).to.contain('test');
        done();
    });

    it('getArchiveArtifact', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const contents = bait.getArchiveArtifact(jobId, runId, 'test.lab');
        expect(contents).to.contain('test');
        done();
    });

    it('getTestResult', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const result = bait.getTestResult(jobId, runId);
        //console.log(result);
        expect(result.totalTests).to.exist();
        expect(result.tests).to.exist();
        expect(result.coveragePercent).to.exist();
        expect(result.coverage).to.exist();
        expect(result.totalDuration).to.exist();
        expect(result.totalLeaks).to.exist();
        done();
    });

    it('getArchiveArtifacts', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const files = bait.getArchiveArtifacts(jobId, runId);
        expect(files[0]).to.equal('test.lab');
        done();
    });

    it('getRunByName last', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const run = bait.getRunByName(jobId, 'last');
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(run.finishTime).to.exist();
        expect(run.status).to.equal('succeeded');
        done();
    });

    it('deleteRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        bait.deleteRun(jobId, null, runId);
        const deleteRuns = bait.getRuns(jobId, null);
        expect(deleteRuns.length).to.equal(0);
        done();
    });

    it('deleteWorkspace', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteWorkspace(jobId);
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

    it('createJob runOnCommit', (done) => {

        // switching this to pail later
        const config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master',
                runOnCommit: true
            },
            body: [
                'npm install',
                'npm test'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            expect(createJob.scm.url).to.equal('https://github.com/fishin/pail');
            done();
        });
    });

    it('startJob runOnCommit 1', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('getRun runOnCommit 1', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj2 = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj2);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commit).to.be.length(40);
                expect(run.commands).to.be.length(2);
                expect(run.commands[1].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('startJob runOnCommit 2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('deleteJob runOnCommit', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob fail', (done) => {

        const config = {
            name: 'scm',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/pail',
                branch: 'master1'
            },
            body: [
                'npm install',
                'npm test'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            expect(createJob.scm.url).to.equal('https://github.com/fishin/pail');
            done();
        });
    });

    it('startJob fail', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            const runId = runs[0].id;
            const run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('getRun fail', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj3 = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj3);
                console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(2);
                expect(run.commands[1].stdout).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob fail', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob no body', (done) => {

        // switching this to pail later
        const config = {
            name: 'prs',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/bobber',
                branch: 'master'
            }
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob no body', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            const runId = runs[0].id;
            const run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('getRun no body', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
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

    it('deleteJob nobody', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob noscm', (done) => {

        const config = {
            name: 'noscm',
            scm: {
                type: 'none'
            },
            body: ['uptime']
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            expect(createJob.body[0]).to.equal('uptime');
            expect(createJob.scm.type).to.equal('none');
            done();
        });
    });

    it('updateJob noscm', (done) => {

        const config = {
            scm: {
                type: 'none',
                url: 'https://github.com/fishin/pail',
                branch: 'master'
            }
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.scm.type).to.equal('none');
            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.exist();
            expect(updateJob.body[0]).to.equal('uptime');
            expect(updateJob.scm.branch).to.equal('master');
            expect(updateJob.scm.url).to.equal('https://github.com/fishin/pail');
            done();
        });
    });

    it('startJob noscm', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            const runId = runs[0].id;
            const run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(1);
            done();
        });
    });

    it('getRun noscm', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj1 = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj1);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commit).to.not.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob noscm', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
