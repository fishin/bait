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

describe('cancel', () => {

    it('createJob', (done) => {

        const config = {
            name: 'cancel',
            body: [
                'sleep 5',
                'date'
            ]
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

    it('cancelRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        bait.cancelRun(jobId, null, runId);
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.status).to.equal('cancelled');
                expect(run.commands.length).to.equal(2);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[0].signal).to.equal('SIGTERM');
                expect(run.commands[1].startTime).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('getRunByName lastCancel', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const run = bait.getRunByName(jobId, 'lastCancel');
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(run.finishTime).to.exist();
        expect(run.status).to.equal('cancelled');
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

    it('createJob npm', (done) => {

        const config = {
            name: 'npm',
            body: [
                'npm install',
                'uptime'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('startJob npm', (done) => {

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

    it('cancelRun npm', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        bait.cancelRun(jobId, null, runId);
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.status).to.equal('cancelled');
                expect(run.commands.length).to.equal(2);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[0].signal).to.equal('SIGTERM');
                expect(run.commands[1].startTime).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('deleteJob npm', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
