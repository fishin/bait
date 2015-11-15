'use strict';

const Code = require('code');
const Lab = require('lab');

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

describe('notify', () => {

    it('createJob', (done) => {

        // switching this to pail later
        const config = {
            name: 'notify',
            body: [
                'invalid'
            ],
            notify: {
                type: 'email',
                to: 'lloyd.benson@gmail.com',
                subject: 'subject',
                message: 'message',
                statuses: [
                    'failed',
                    'fixed'
                ]
            }
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
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            //console.log(run);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('updateJob no status match', (done) => {

        const config = {
            notify: {
                statuses: [
                    'succeeded'
                ]
            }
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.exist();
            expect(updateJob.notify.statuses[0]).to.equal('succeeded');
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
            expect(runs.length).to.equal(2);
            done();
        });
    });

    it('getRun', (done) => {

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
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].stdout).to.exist();
                done();
            }
        }, 1000);
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

    it('createJob nonotify', (done) => {

        // switching this to pail later
        const config = {
            name: 'nonotify',
            body: [
                'invalid'
            ],
            notify: {
                type: 'none',
                to: 'lloyd.benson@gmail.com',
                subject: 'subject',
                message: 'message',
                statuses: [
                    'failed',
                    'fixed'
                ]
            }
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob nonotify', (done) => {

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

    it('getRun nonotify', (done) => {

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
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].stdout).to.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob nonotify', (done) => {

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
                branch: 'master'
            },
            body: ['date'],
            notify: {
                type: 'email',
                to: 'lloyd.benson@gmail.com',
                subject: 'subject',
                message: 'message',
                statuses: [
                    'succeeded'
                ]
            }
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

    it('deleteJob', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
