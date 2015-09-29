var Code = require('code');
var Lab = require('lab');
var Pail = require('pail');

var Bait = require('../lib/index');

var internals = {
    defaults: {
        dirPath: __dirname + '/tmp'
    }
};

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

describe('runs', function () {

    it('createJob', function (done) {

        // switching this to pail later
        var config = {
            name: 'job',
            body: [
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        bait.createJob(config, function (createJob) {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('deleteRun many', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        // 2 success
        var pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        var successConfig1 = { name: 'success1', foo: 'bar' };
        var successPail1 = pail.createPail(successConfig1);
        expect(successPail1.name).to.equal('success1');
        expect(successPail1.status).to.equal('created');
        successPail1.status = 'succeeded';
        var updateSuccessPail1 = pail.updatePail(successPail1);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        var successConfig2 = { name: 'success2', foo: 'bar' };
        var successPail2 = pail.createPail(successConfig2);
        expect(successPail2.name).to.equal('success2');
        expect(successPail2.status).to.equal('created');
        successPail2.status = 'succeeded';
        var updateSuccessPail2 = pail.updatePail(successPail2);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        // 2 failed
        var failConfig1 = { name: 'fail1', foo: 'bar' };
        var failPail1 = pail.createPail(failConfig1);
        expect(failPail1.name).to.equal('fail1');
        expect(failPail1.status).to.equal('created');
        failPail1.status = 'failed';
        var updateFailPail1 = pail.updatePail(failPail1);
        expect(updateFailPail1.status).to.equal('failed');
        var failConfig2 = { name: 'fail2', foo: 'bar' };
        var failPail2 = pail.createPail(failConfig2);
        expect(failPail2.name).to.equal('fail2');
        expect(failPail2.status).to.equal('created');
        failPail2.status = 'failed';
        var updateFailPail2 = pail.updatePail(failPail2);
        expect(updateFailPail2.status).to.equal('failed');
        // 2 cancelled
        var cancelConfig1 = { name: 'cancel1', foo: 'bar' };
        var cancelPail1 = pail.createPail(cancelConfig1);
        expect(cancelPail1.name).to.equal('cancel1');
        expect(cancelPail1.status).to.equal('created');
        cancelPail1.status = 'cancelled';
        var updateCancelPail1 = pail.updatePail(cancelPail1);
        expect(updateCancelPail1.status).to.equal('cancelled');
        var cancelConfig2 = { name: 'cancel2', foo: 'bar' };
        var cancelPail2 = pail.createPail(cancelConfig2);
        expect(cancelPail2.name).to.equal('cancel2');
        expect(cancelPail2.status).to.equal('created');
        cancelPail2.status = 'cancelled';
        var updateCancelPail2 = pail.updatePail(cancelPail2);
        expect(updateCancelPail2.status).to.equal('cancelled');
        var successConfig3 = { name: 'success3', foo: 'bar' };
        var successPail3 = pail.createPail(successConfig3);
        expect(successPail3.name).to.equal('success3');
        expect(successPail3.status).to.equal('created');
        successPail3.status = 'fixed';
        var updateSuccessPail3 = pail.updatePail(successPail3);
        expect(updateSuccessPail3.status).to.equal('fixed');
        var successConfig4 = { name: 'success4', foo: 'bar' };
        var successPail4 = pail.createPail(successConfig4);
        expect(successPail4.name).to.equal('success4');
        expect(successPail4.status).to.equal('created');
        successPail4.status = 'succeeded';
        var updateSuccessPail4 = pail.updatePail(successPail4);
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

    it('deleteRun not last', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        // 3 success
        var pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        var successConfig1 = { name: 'success1', foo: 'bar' };
        var successPail1 = pail.createPail(successConfig1);
        expect(successPail1.name).to.equal('success1');
        expect(successPail1.status).to.equal('created');
        successPail1.status = 'succeeded';
        var updateSuccessPail1 = pail.updatePail(successPail1);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        var successConfig2 = { name: 'success2', foo: 'bar' };
        var successPail2 = pail.createPail(successConfig2);
        expect(successPail2.name).to.equal('success2');
        expect(successPail2.status).to.equal('created');
        successPail2.status = 'succeeded';
        var updateSuccessPail2 = pail.updatePail(successPail2);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        var successConfig3 = { name: 'success3', foo: 'bar' };
        var successPail3 = pail.createPail(successConfig3);
        expect(successPail3.name).to.equal('success3');
        expect(successPail3.status).to.equal('created');
        successPail3.status = 'succeeded';
        var updateSuccessPail3 = pail.updatePail(successPail3);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        bait.deleteRun(jobId, null, successPail2.id);
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        bait.deleteRun(jobId, null, successPail1.id);
        bait.deleteRun(jobId, null, successPail3.id);
        done();
    });

    it('getPreviousRun', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        // 3 success
        var pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        var successConfig1 = { name: 'success1', foo: 'bar' };
        var successPail1 = pail.createPail(successConfig1);
        expect(successPail1.name).to.equal('success1');
        expect(successPail1.status).to.equal('created');
        successPail1.status = 'succeeded';
        var updateSuccessPail1 = pail.updatePail(successPail1);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        var successConfig2 = { name: 'success2', foo: 'bar' };
        var successPail2 = pail.createPail(successConfig2);
        expect(successPail2.name).to.equal('success2');
        expect(successPail2.status).to.equal('created');
        successPail2.status = 'succeeded';
        var updateSuccessPail2 = pail.updatePail(successPail2);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        var successConfig3 = { name: 'success3', foo: 'bar' };
        var successPail3 = pail.createPail(successConfig3);
        expect(successPail3.name).to.equal('success3');
        expect(successPail3.status).to.equal('created');
        successPail3.status = 'succeeded';
        var updateSuccessPail3 = pail.updatePail(successPail3);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(successPail3.id);
        var run = bait.getPreviousRun(jobId, null, successPail3.id);
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

    it('deleteJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });

    it('createJob deleteRuns', function (done) {

        // switching this to pail later
        var config = {
            name: 'deleteRuns',
            body: [
                'date'
            ]
        };
        var bait = new Bait(internals.defaults);
        bait.createJob(config, function (createJob) {

            expect(createJob.id).to.exist();
            done();
        });
    });

    it('deleteRuns', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var pail = new Pail({ dirPath: internals.defaults.dirPath + '/' + jobId });
        var successConfig = { name: 'success', foo: 'bar' };
        var successPail = pail.createPail(successConfig);
        expect(successPail.name).to.equal('success');
        expect(successPail.status).to.equal('created');
        successPail.status = 'succeeded';
        var updateSuccessPail = pail.updatePail(successPail);
        expect(updateSuccessPail.status).to.equal('succeeded');
        var runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        bait.deleteRuns(jobId, null);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(0);
        done();
    });

    it('deleteJob deleteRuns', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
});
