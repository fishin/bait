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

describe('schedule', () => {

    it('createJob job', (done) => {

        // switching this to pail later
        const config = {
            name: 'job',
            body: ['date'],
            schedule: {
                type: 'cron',
                pattern: '*/5 * * * *'
            }
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            expect(createJob.schedule.pattern).to.equal('*/5 * * * *');
            done();
        });
    });

    it('updateJob job', (done) => {

        const config = {
            schedule: {
                pattern: '*/10 * * * *'
            }
        };
        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.updateJob(jobId, config, (updateJob) => {

            expect(updateJob.id).to.exist();
            expect(updateJob.schedule.pattern).to.equal('*/10 * * * *');
            done();
        });
    });

    it('deleteJob job', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
