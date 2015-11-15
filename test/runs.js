'use strict';

const Code = require('code');
const Lab = require('lab');
const Pail = require('pail');

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

describe('runs', () => {

    it('createJob', (done) => {

        // switching this to pail later
        const config = {
            name: 'job',
            body: [
                'date'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('deleteRun many', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        // 2 success
        const pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        const successConfig1 = { name: 'success1', foo: 'bar' };
        const successPail1 = pail.createPail(successConfig1);
        expect(successPail1.name).to.equal('success1');
        expect(successPail1.status).to.equal('created');
        successPail1.status = 'succeeded';
        const updateSuccessPail1 = pail.updatePail(successPail1);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        const successConfig2 = { name: 'success2', foo: 'bar' };
        const successPail2 = pail.createPail(successConfig2);
        expect(successPail2.name).to.equal('success2');
        expect(successPail2.status).to.equal('created');
        successPail2.status = 'succeeded';
        const updateSuccessPail2 = pail.updatePail(successPail2);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        // 2 failed
        const failConfig1 = { name: 'fail1', foo: 'bar' };
        const failPail1 = pail.createPail(failConfig1);
        expect(failPail1.name).to.equal('fail1');
        expect(failPail1.status).to.equal('created');
        failPail1.status = 'failed';
        const updateFailPail1 = pail.updatePail(failPail1);
        expect(updateFailPail1.status).to.equal('failed');
        const failConfig2 = { name: 'fail2', foo: 'bar' };
        const failPail2 = pail.createPail(failConfig2);
        expect(failPail2.name).to.equal('fail2');
        expect(failPail2.status).to.equal('created');
        failPail2.status = 'failed';
        const updateFailPail2 = pail.updatePail(failPail2);
        expect(updateFailPail2.status).to.equal('failed');
        // 2 cancelled
        const cancelConfig1 = { name: 'cancel1', foo: 'bar' };
        const cancelPail1 = pail.createPail(cancelConfig1);
        expect(cancelPail1.name).to.equal('cancel1');
        expect(cancelPail1.status).to.equal('created');
        cancelPail1.status = 'cancelled';
        const updateCancelPail1 = pail.updatePail(cancelPail1);
        expect(updateCancelPail1.status).to.equal('cancelled');
        const cancelConfig2 = { name: 'cancel2', foo: 'bar' };
        const cancelPail2 = pail.createPail(cancelConfig2);
        expect(cancelPail2.name).to.equal('cancel2');
        expect(cancelPail2.status).to.equal('created');
        cancelPail2.status = 'cancelled';
        const updateCancelPail2 = pail.updatePail(cancelPail2);
        expect(updateCancelPail2.status).to.equal('cancelled');
        const successConfig3 = { name: 'success3', foo: 'bar' };
        const successPail3 = pail.createPail(successConfig3);
        expect(successPail3.name).to.equal('success3');
        expect(successPail3.status).to.equal('created');
        successPail3.status = 'fixed';
        const updateSuccessPail3 = pail.updatePail(successPail3);
        expect(updateSuccessPail3.status).to.equal('fixed');
        const successConfig4 = { name: 'success4', foo: 'bar' };
        const successPail4 = pail.createPail(successConfig4);
        expect(successPail4.name).to.equal('success4');
        expect(successPail4.status).to.equal('created');
        successPail4.status = 'succeeded';
        const updateSuccessPail4 = pail.updatePail(successPail4);
        expect(updateSuccessPail4.status).to.equal('succeeded');
        // now start deleting stuff
        bait.deleteRun(jobId, null, successPail4.id);
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(successPail3.id);
        bait.deleteRun(jobId, null, successPail3.id);
        expect(pail.getPailByName('last')).to.equal(cancelPail2.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(successPail2.id);
        expect(pail.getPailByName('lastCancel')).to.equal(cancelPail2.id);
        bait.deleteRun(jobId, null, cancelPail2.id);
        expect(pail.getPailByName('last')).to.equal(cancelPail1.id);
        expect(pail.getPailByName('lastCancel')).to.equal(cancelPail1.id);
        bait.deleteRun(jobId, null, cancelPail1.id);
        expect(pail.getPailByName('last')).to.equal(failPail2.id);
        expect(pail.getPailByName('lastFail')).to.equal(failPail2.id);
        expect(pail.getPailByName('lastCancel')).to.not.exist();
        bait.deleteRun(jobId, null, failPail2.id);
        expect(pail.getPailByName('last')).to.equal(failPail1.id);
        expect(pail.getPailByName('lastFail')).to.equal(failPail1.id);
        bait.deleteRun(jobId, null, failPail1.id);
        expect(pail.getPailByName('last')).to.equal(successPail2.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(successPail2.id);
        expect(pail.getPailByName('lastFail')).to.not.exist();
        bait.deleteRun(jobId, null, successPail2.id);
        expect(pail.getPailByName('last')).to.equal(successPail1.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(successPail1.id);
        bait.deleteRun(jobId, null, successPail1.id);
        expect(pail.getPailByName('last')).to.not.exist();
        expect(pail.getPailByName('lastSuccess')).to.not.exist();
        done();
    });

    it('deleteRun not last', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        // 3 success
        const pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        const successConfig1 = { name: 'success1', foo: 'bar' };
        const successPail1 = pail.createPail(successConfig1);
        expect(successPail1.name).to.equal('success1');
        expect(successPail1.status).to.equal('created');
        successPail1.status = 'succeeded';
        const updateSuccessPail1 = pail.updatePail(successPail1);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        const successConfig2 = { name: 'success2', foo: 'bar' };
        const successPail2 = pail.createPail(successConfig2);
        expect(successPail2.name).to.equal('success2');
        expect(successPail2.status).to.equal('created');
        successPail2.status = 'succeeded';
        const updateSuccessPail2 = pail.updatePail(successPail2);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        const successConfig3 = { name: 'success3', foo: 'bar' };
        const successPail3 = pail.createPail(successConfig3);
        expect(successPail3.name).to.equal('success3');
        expect(successPail3.status).to.equal('created');
        successPail3.status = 'succeeded';
        const updateSuccessPail3 = pail.updatePail(successPail3);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        bait.deleteRun(jobId, null, successPail2.id);
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        bait.deleteRun(jobId, null, successPail1.id);
        bait.deleteRun(jobId, null, successPail3.id);
        done();
    });

    it('getPreviousRun', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        // 3 success
        const pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        const successConfig1 = { name: 'success1', foo: 'bar' };
        const successPail1 = pail.createPail(successConfig1);
        expect(successPail1.name).to.equal('success1');
        expect(successPail1.status).to.equal('created');
        successPail1.status = 'succeeded';
        const updateSuccessPail1 = pail.updatePail(successPail1);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        const successConfig2 = { name: 'success2', foo: 'bar' };
        const successPail2 = pail.createPail(successConfig2);
        expect(successPail2.name).to.equal('success2');
        expect(successPail2.status).to.equal('created');
        successPail2.status = 'succeeded';
        const updateSuccessPail2 = pail.updatePail(successPail2);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        const successConfig3 = { name: 'success3', foo: 'bar' };
        const successPail3 = pail.createPail(successConfig3);
        expect(successPail3.name).to.equal('success3');
        expect(successPail3.status).to.equal('created');
        successPail3.status = 'succeeded';
        const updateSuccessPail3 = pail.updatePail(successPail3);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        let run = bait.getPreviousRun(jobId, null, successPail3.id);
        expect(run.id).to.equal(successPail2.id);
        run = bait.getPreviousRun(jobId, null, successPail2.id);
        expect(run.id).to.equal(successPail1.id);
        run = bait.getPreviousRun(jobId, null, successPail1.id);
        expect(run).to.not.exist();
        bait.deleteRun(jobId, null, successPail1.id);
        bait.deleteRun(jobId, null, successPail2.id);
        bait.deleteRun(jobId, null, successPail3.id);
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

    it('createJob deleteRuns', (done) => {

        // switching this to pail later
        const config = {
            name: 'deleteRuns',
            body: [
                'date'
            ]
        };
        const bait = new Bait(internals.defaults);
        bait.createJob(config, (createJob) => {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('deleteRuns', (done) => {

        const bait = new Bait(internals.defaults);
        const jobs = bait.getJobs();
        const jobId = jobs[0].id;
        const pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        const successConfig = { name: 'success', foo: 'bar' };
        const successPail = pail.createPail(successConfig);
        expect(successPail.name).to.equal('success');
        expect(successPail.status).to.equal('created');
        successPail.status = 'succeeded';
        const updateSuccessPail = pail.updatePail(successPail);
        expect(updateSuccessPail.status).to.equal('succeeded');
        let runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        bait.deleteRuns(jobId, null);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(0);
        done();
    });

    it('deleteJob deleteRuns', (done) => {

        const bait = new Bait(internals.defaults);
        let jobs = bait.getJobs();
        const jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
