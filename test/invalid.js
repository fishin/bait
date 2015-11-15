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

describe('invalid', () => {

    it('getRun', (done) => {

        const bait = new Bait(internals.defaults);
        const run = bait.getRun('invalid', null, 'invalid');
        expect(run).to.not.exist();
        done();
    });

    it('createJob cmd', (done) => {

        const config = {
            name: 'invalid',
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

    it('updateJob cmd scm https', (done) => {

        const config = {
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/invalid',
                branch: 'master'
            }
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.not.exist();
            expect(updateJob.scm).to.not.exist();
            done();
        });
    });

    it('updateJob cmd scm type', (done) => {

        const config = {
            scm: {
                type: 'invalid'
            }
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.updateTime).to.not.exist();
            expect(updateJob.scm).to.not.exist();
            done();
        });
    });

    it('startJob cmd', (done) => {

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

    it('getRun cmd', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const runs = bait.getRuns(jobId, null);
        const runId = runs[0].id;
        const intervalObj = setInterval(() => {

            const run = bait.getRun(jobId, null, runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                //console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(1);
                expect(run.commands[0].error).to.exist();
                expect(run.finishTime).to.exist();
                expect(run.finishTime).to.be.above(run.startTime);
                done();
            }
        }, 1000);
    });

    it('deleteJob cmd', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob invalid scm type', (done) => {

        const config = {
            name: 'invalid',
            scm: {
                type: 'invalid'
            }
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.not.exist();
            expect(createJob.message).to.exist();
            done();
        });
    });

    it('createJob scm invalid repo http', (done) => {

        const config = {
            name: 'http',
            scm: {
                type: 'git',
                url: 'https://github.com/fishin/invalid',
                branch: 'master'
            }
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.not.exist();
            expect(createJob.message).to.exist();
            done();
        });
    });
});
