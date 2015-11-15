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

describe('normal', () => {

    it('getActiveJobs', (done) => {

        const bait = new Bait(internals.defaults);
        const active = bait.getActiveJobs();
        expect(active).to.be.empty();
        done();
    });

    it('getActivePullRequests', (done) => {

        const bait = new Bait(internals.defaults);
        const active = bait.getActivePullRequests();
        expect(active).to.be.empty();
        done();
    });

    it('createJob job1', (done) => {

        // switching this to pail later
        const config = {
            name: 'job1',
            body: [
                ['uptime', 'sleep 2'],
                'date'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('createJob job2', (done) => {

        const config = {
            name: 'job2',
            head: ['date'],
            body: ['', 'uptime'],
            tail: ['cat /etc/hosts']
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('getJobs', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        expect(jobs.length).to.equal(2);
        done();
    });

    it('updateJob job2', (done) => {

        const config = {
            description: 'desc'
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.exist();
            expect(updateJob.description).to.equal('desc');
            done();
        });
    });

    it('getJobByName job1', (done) => {

        const bait = new Bait(internals.defaults);
        const job = bait.getJobByName('job1');
        expect(job.id).to.exist();
        expect(job.name).to.equal('job1');
        done();
    });

    it('startJob job1', (done) => {

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

    it('startJob job2 1', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
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

    it('getRunPids 1', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const pids = bait.getRunPids(jobId, null, runId);
        expect(pids.length).to.equal(1);
        done();
    });

    it('getRun job1', (done) => {

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
                expect(run.commands).to.be.length(3);
                expect(run.commands[2].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('getRun job2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(3);
                done();
            }
        }, 1000);
    });

    it('startJob job2 2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            const runId = runs[0].id;
            const run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(2);
            done();
        });
    });

    it('getRun job2 2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(3);
                done();
            }
        }, 1000);
    });

    it('startJob job2 3', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            const runId = runs[0].id;
            const run = bait.getRun(jobId, null, runId);
            expect(run.id).to.exist();
            expect(run.startTime).to.exist();
            expect(runs.length).to.equal(3);
            done();
        });
    });

    it('startJob job2 4', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.startJob(jobId, null, () => {

            const runs = bait.getRuns(jobId, null);
            expect(runs.length).to.equal(3);
            done();
        });
    });

    it('getRun job2 3', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        const runs = bait.getRuns(jobId, null);
        // job 4 shouldnt have been added
        const runId = runs[1].id;
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(3);
                done();
            }
        }, 1000);
    });

    it('getRunPids 0', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const pids = bait.getRunPids(jobId, null, runId);
        expect(pids.length).to.equal(0);
        done();
    });

    it('getAllCommits job2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.getAllCommits(jobId, (commits) => {

            //console.log(commits);
            expect(commits.length).to.be.equal(0);
            done();
        });
    });

    it('getLatestCommit job2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.getLatestCommit(jobId, (commit) => {

            expect(commit).to.not.exist();
            done();
        });
    });

    it('getLatestRemoteCommit job2', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.getLatestRemoteCommit(jobId, (commit) => {

            expect(commit).to.not.exist();
            done();
        });
    });

    it('getCompareCommits', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[1].id;
        bait.getCompareCommits(jobId, 1, 2, (compareCommits) => {

            //console.log(compareCommits);
            expect(compareCommits.length).to.equal(0);
            done();
        });
    });

    it('deleteJob job1', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        done();
    });

    it('deleteJob job2', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
