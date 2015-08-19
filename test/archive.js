var Code = require('code');
var Fs = require('fs');
var Lab = require('lab');
var Hapi = require('hapi');
var Pail = require('pail');
var Path = require('path');

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

describe('archiveArtifacts', function () {

    it('archiveArtifacts maxdays', function (done) {

        try {
            Fs.mkdirSync(internals.defaults.dirPath);
        }
        catch (err) {

            //dont care
        }
        var jobDir = Path.join(internals.defaults.dirPath, 'job');
        var pail = new Pail(internals.defaults);
        pail.createDir('job');
        var jobId = '12345678-1234-1234-1234-123456789012';
        var jobConfig = {
            id: jobId,
            name: 'archive',
            archive: {
                type: 'maxdays',
                maxNumber: 1,
                pattern: 'config.json'
            }
        };
        pail.createDir(Path.join('job', jobId));
        Fs.writeFileSync(Path.join(jobDir, jobId, 'config.json'), JSON.stringify(jobConfig));
        var runId1 = '12345678-1234-1234-1234-123456789011';
        pail.createDir(Path.join('job', jobId, runId1));
        var startTime = new Date().getTime() - 1000 * 60 * 60 * 24;
        var runConfig = {
            id: runId1,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId1, 'config.json'), JSON.stringify(runConfig));
        var runId2 = '12345678-1234-1234-1234-123456789012';
        pail.createDir(Path.join('job', jobId, runId2));
        startTime = new Date().getTime();
        runConfig = {
            id: runId2,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId2, 'config.json'), JSON.stringify(runConfig));
        var bait = new Bait({ dirPath: jobDir });
        var jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        var runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(2);
        bait.archiveArtifacts(jobId, runs[1].id);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        pail.deleteDir('job');
        done();
    });

    it('archiveArtifacts maxnum', function (done) {

        var jobDir = Path.join(internals.defaults.dirPath, 'job');
        var pail = new Pail(internals.defaults);
        pail.createDir('job');
        var jobId = '12345678-1234-1234-1234-123456789012';
        var jobConfig = {
            id: jobId,
            name: 'archive',
            archive: {
                type: 'maxnum',
                maxNumber: 1,
                pattern: 'config.json'
            }
        };
        pail.createDir(Path.join('job', jobId));
        Fs.writeFileSync(Path.join(jobDir, jobId, 'config.json'), JSON.stringify(jobConfig));
        var runId1 = '12345678-1234-1234-1234-123456789011';
        pail.createDir(Path.join('job', jobId, runId1));
        var startTime = new Date().getTime();
        var runConfig = {
            id: runId1,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId1, 'config.json'), JSON.stringify(runConfig));
        var runId2 = '12345678-1234-1234-1234-123456789012';
        pail.createDir(Path.join('job', jobId, runId2));
        runConfig = {
            id: runId2,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId2, 'config.json'), JSON.stringify(runConfig));
        var bait = new Bait({ dirPath: jobDir });
        var jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        var runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(2);
        bait.archiveArtifacts(jobId, runs[1].id);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        pail.deleteDir('job');
        done();
    });

    it('archive none', function (done) {

        var jobDir = Path.join(internals.defaults.dirPath, 'job');
        var pail = new Pail(internals.defaults);
        pail.createDir('job');
        var jobId = '12345678-1234-1234-1234-123456789012';
        var jobConfig = {
            id: jobId,
            name: 'archive',
            archive: {
                type: 'none'
            }
        };
        pail.createDir(Path.join('job', jobId));
        Fs.writeFileSync(Path.join(jobDir, jobId, 'config.json'), JSON.stringify(jobConfig));
        var runId1 = '12345678-1234-1234-1234-123456789011';
        pail.createDir(Path.join('job', jobId, runId1));
        var startTime = new Date().getTime();
        var runConfig = {
            id: runId1,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId1, 'config.json'), JSON.stringify(runConfig));
        var bait = new Bait({ dirPath: jobDir });
        var jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        var runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        bait.archiveArtifacts(jobId, runs[0].id);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        pail.deleteDir('job');
        done();
    });
});
