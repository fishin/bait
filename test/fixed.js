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

describe('fixed', () => {

    it('createJob', (done) => {

        // switching this to pail later
        const config = {
            name: 'fixed',
            body: [
                'invalid'
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

    it('getRun failed', (done) => {

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
                done();
            }
        }, 1000);
    });

    it('updateJob', (done) => {

        const config = {
            body: [
                'date'
            ]
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.exist();
            expect(updateJob.body[0]).to.equal('date');
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

    it('getRun fixed', (done) => {

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
                expect(run.status).to.equal('fixed');
                expect(run.id).to.exist();
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
