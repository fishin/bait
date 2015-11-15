'use strict';

const Code = require('code');
const Fs = require('fs');
const Lab = require('lab');
const Pail = require('pail');
const Path = require('path');

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

describe('archiveArtifacts', () => {

    it('archiveArtifacts maxdays', (done) => {

        try {
            Fs.mkdirSync(internals.defaults.dirPath);
        }
        catch (err) {

            //dont care
        }
        const jobDir = Path.join(internals.defaults.dirPath, 'job');
        const pail = new Pail(internals.defaults);
        pail.createDir('job');
        const jobId = '12345678-1234-1234-1234-123456789012';
        const jobConfig = {
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
        const runId1 = '12345678-1234-1234-1234-123456789011';
        pail.createDir(Path.join('job', jobId, runId1));
        let startTime = new Date().getTime() - 1000 * 60 * 60 * 24;
        let runConfig = {
            id: runId1,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId1, 'config.json'), JSON.stringify(runConfig));
        const runId2 = '12345678-1234-1234-1234-123456789012';
        pail.createDir(Path.join('job', jobId, runId2));
        startTime = new Date().getTime();
        runConfig = {
            id: runId2,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId2, 'config.json'), JSON.stringify(runConfig));
        const bait = new Bait({ dirPath: jobDir });
        const jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        let runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(2);
        bait.archiveArtifacts(jobId, runs[1].id);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        pail.deleteDir('job');
        done();
    });

    it('archiveArtifacts maxnum', (done) => {

        const jobDir = Path.join(internals.defaults.dirPath, 'job');
        const pail = new Pail(internals.defaults);
        pail.createDir('job');
        const jobId = '12345678-1234-1234-1234-123456789012';
        const jobConfig = {
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
        const runId1 = '12345678-1234-1234-1234-123456789011';
        pail.createDir(Path.join('job', jobId, runId1));
        const startTime = new Date().getTime();
        let runConfig = {
            id: runId1,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId1, 'config.json'), JSON.stringify(runConfig));
        const runId2 = '12345678-1234-1234-1234-123456789012';
        pail.createDir(Path.join('job', jobId, runId2));
        runConfig = {
            id: runId2,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId2, 'config.json'), JSON.stringify(runConfig));
        const bait = new Bait({ dirPath: jobDir });
        const jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        let runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(2);
        bait.archiveArtifacts(jobId, runs[1].id);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        pail.deleteDir('job');
        done();
    });

    it('archive none', (done) => {

        const jobDir = Path.join(internals.defaults.dirPath, 'job');
        const pail = new Pail(internals.defaults);
        pail.createDir('job');
        const jobId = '12345678-1234-1234-1234-123456789012';
        const jobConfig = {
            id: jobId,
            name: 'archive',
            archive: {
                type: 'none'
            }
        };
        pail.createDir(Path.join('job', jobId));
        Fs.writeFileSync(Path.join(jobDir, jobId, 'config.json'), JSON.stringify(jobConfig));
        const runId1 = '12345678-1234-1234-1234-123456789011';
        pail.createDir(Path.join('job', jobId, runId1));
        const startTime = new Date().getTime();
        const runConfig = {
            id: runId1,
            startTime: startTime
        };
        Fs.writeFileSync(Path.join(jobDir, jobId, runId1, 'config.json'), JSON.stringify(runConfig));
        const bait = new Bait({ dirPath: jobDir });
        const jobs = bait.getJobs();
        expect(jobs.length).to.equal(1);
        let runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        bait.archiveArtifacts(jobId, runs[0].id);
        runs = bait.getRuns(jobId, null);
        expect(runs.length).to.equal(1);
        pail.deleteDir('job');
        done();
    });
});
