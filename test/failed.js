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

describe('failed', () => {

    it('createJob', (done) => {


        const config = {
            name: 'bad',
            body: [
                'date',
                'uptime',
                ['ls -altr', 'npm invalid', 'ls -altr'],
                'cat /etc/hosts'
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

    it('getRun finish', (done) => {

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
                expect(run.commands).to.be.length(4);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[3].stderr).to.exist();
                expect(run.commands[3].code).to.exist();
                done();
            }
        }, 1000);
    });

    it('getRunByName lastFail', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const run = bait.getRunByName(jobId, 'lastFail');
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        expect(run.finishTime).to.exist();
        expect(run.status).to.equal('failed');
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
});
