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

describe('runs', function () {    

    it('createRun git', function (done) {

        var bait = new Bait(internals.defaults);
        var commands = [
            'git clone --branch=master https://github.com/fishin/pail .',
        ];
        var run = bait.Utils.createRun(commands);
        expect(run.id).to.exist();
        done();
    });

    it('createRun date', function (done) {

        var bait = new Bait(internals.defaults);
        var commands = [
            'date'
        ];
        var run = bait.Utils.createRun(commands);
        expect(run.id).to.exist();
        done();
    });

    it('startRun git', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        bait.Utils.startRun(runId);
        var run = bait.Utils.getRun(runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        done();
    });

    it('startRun date', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[1];
        bait.Utils.startRun(runId);
        var run = bait.Utils.getRun(runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        done();
    });

    it('getRun git', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var intervalObj = setInterval(function() {

            var run = bait.Utils.getRun(runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.createTime).to.exist();
                expect(run.commands).to.exist();
                done();
            }
        }, 1000); 
    });

    it('getRun date', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[1];
        var intervalObj = setInterval(function() {

            var run = bait.Utils.getRun(runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.createTime).to.exist();
                expect(run.commands).to.exist();
                done();
            }
        }, 1000); 
    });

    it('deleteRun git', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        var run = bait.Utils.deleteRun(runId);
        var deleteRuns = bait.Utils.getRuns();
        expect(deleteRuns.length).to.equal(1);
        done();
    });

    it('deleteRun date', function (done) {

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
