var Code = require('code');
var Lab = require('lab');

var Bait = require('../lib/index');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        dirPath: '/tmp/testbait'
    }
};

describe('run', function () {    

    it('createRun', function (done) {

        var bait = new Bait(internals.defaults);
        var commands = [
            'git clone --branch=master https://github.com/fishin/reel .',
            'npm install',
            'bin/test.sh',
            [ 'uptime', 'npm list', 'ls -altr' ],
            'date'
        ];
        var run = bait.Utils.createRun(commands);
        expect(run.id).to.exist();
        done();
    });

    it('getRuns', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        expect(runs.length).to.equal(1);
        done();
    });

    it('getRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var run = bait.Utils.getRun(runId);
        expect(run.id).to.exist();
        expect(run.createTime).to.exist();
        expect(run.commands).to.exist();
        done();
    });

    it('startRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        bait.Utils.startRun(runId);
        var run = bait.Utils.getRun(runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        done();
    });

    it('getRunPids 1', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var pids = bait.Utils.getRunPids(runId);
        expect(pids.length).to.equal(1);
        done();
    });

    it('getRun finish', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var intervalObj = setInterval(function() {
            var run = bait.Utils.getRun(runId);
            if (run.finishTime) {
                clearInterval(intervalObj); 
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.id).to.exist();
                expect(run.commands).to.be.length(7);
                expect(run.commands[2].stdout).to.equal('reelin em in\n');
                done();
            } 
        }, 1000); 
    });

    it('getRunPids 0', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var pids = bait.Utils.getRunPids(runId);
        expect(pids.length).to.equal(0);
        done();
    });

    it('getWorkspaceArtifact', function (done) {

        var bait = new Bait(internals.defaults);
        var contents = bait.Utils.getWorkspaceArtifact('bin/test.sh');
        expect(contents).to.contain('reelin em in');
        done();
    });

    it('getRunByLink last', function (done) {

        var bait = new Bait(internals.defaults);
        var run = bait.Utils.getRunByLink('last');
        expect(run.id).to.exist();
        done();
    });

    it('getRunByLink lastFail', function (done) {

        var bait = new Bait(internals.defaults);
        var run = bait.Utils.getRunByLink('lastFail');
        expect(run).to.not.exist();
        done();
    });

    it('deleteRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var run = bait.Utils.deleteRun(runId);
        var deleteRuns = bait.Utils.getRuns();
        expect(deleteRuns.length).to.equal(0);
        done();
    });

    it('deleteWorkspace', function (done) {

        var bait = new Bait(internals.defaults);
        bait.Utils.deleteWorkspace();
        done();
    });
});

