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

describe('invalid', function () {    

    it('createRun', function (done) {

        var bait = new Bait(internals.defaults);
        var commands = [
            'date',
            'uptime',
            [ 'ls -altr', 'invalid', 'ls -altr' ],
            'cat /etc/hosts'
        ];
        var run = bait.Utils.createRun(commands);
        expect(run.id).to.exist();
        done();
    });

    it('startRun', function (done) {

        var bait = new Bait(internals.defaults);
        var runs = bait.Utils.getRuns();
        var runId = runs[0];
        bait.Utils.startRun(runId);
        var intervalObj = setInterval(function() {
            var run = bait.Utils.getRun(runId);
            if (run.finishTime) {
                clearInterval(intervalObj);
                expect(run.id).to.exist();
                expect(run.status).to.equal('failed');
                expect(run.commands.length).to.equal(4);
                expect(run.commands[0].startTime).to.exist();
                expect(run.commands[3].error).to.exist();
                done();
            }
        }, 1000);
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
