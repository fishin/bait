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

describe('cancel', function () {    

    it('createRun', function (done) {

        var bait = new Bait(internals.defaults);
        var commands = [
            'sleep 5',
            'date',
            'uptime'
        ];
        var run = bait.createRun(commands);
        expect(run.id).to.exist();
        done();
    });

    it('startRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.getRuns();
        var runId = runs[0];
        bait.startRun(runId);
        var run = bait.getRun(runId);
        expect(run.id).to.exist();
        expect(run.startTime).to.exist();
        done();
    });

    it('cancelRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.getRuns();
        var runId = runs[0];
        bait.cancelRun(runId);
        var intervalObj = setInterval(function() {
            var run = bait.getRun(runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.status).to.equal('cancelled');
                expect(run.commands.length).to.equal(3);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[0].signal).to.equal('SIGTERM');
                expect(run.commands[1].startTime).to.not.exist();
                done();
            }
        }, 1000);
    });

    it('deleteRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.getRuns();
        var runId = runs[0];
        var run = bait.deleteRun(runId);
        var deleteRuns = bait.getRuns();
        expect(deleteRuns.length).to.equal(0);
        done();
    });

    it('deleteWorkspace', function (done) {

        var bait = new Bait(internals.defaults);
        bait.deleteWorkspace();
        done();
    });
});
