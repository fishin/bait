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

describe('command', function () {    

    it('runCommand valid', function (done) {

        var bait = new Bait(internals.defaults);
        var command = 'uptime';
        bait.Utils.runCommand(command, function(result) {

            console.log(result);
            expect(result.status).to.equal('succeeded');
            expect(result.stdout).to.exist();
            done();
        });
    });

    it('runCommand invalid', function (done) {

        var bait = new Bait(internals.defaults);
        var command = 'invalid';
        bait.Utils.runCommand(command, function(result) {

            expect(result.status).to.equal('failed');
            expect(result.error).to.exist();
            done();
        });
    });

    it('runCommand failed', function (done) {

        var bait = new Bait(internals.defaults);
        var command = 'ls lloyd';
        bait.Utils.runCommand(command, function(result) {

            expect(result.status).to.equal('failed');
            expect(result.stderr).to.exist();
            done();
        });
    });
});
