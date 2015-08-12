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

describe('sort jobs', function () {

    it('getJobs', function (done) {

        var jobDir = Path.join(internals.defaults.dirPath, 'job');
        var name = ['a', 'c', 'b'];
        var pail = new Pail(internals.defaults);
        pail.createDir('job');
        for (var i = 1; i < 4; i++) {
            var id = '12345678-1234-1234-1234-12345678901' + i.toString();
            pail.createDir(Path.join('job', id));
            var config = {
                id: id,
                name: name[i - 1]
            };
            Fs.writeFileSync(Path.join(jobDir, id, 'config.json'), JSON.stringify(config));
        }
        var bait = new Bait({ dirPath: jobDir });
        var jobs = bait.getJobs();
        //console.log(jobs);
        expect(jobs.length).to.equal(3);
        expect(jobs[0].name).to.equal('a');
        expect(jobs[1].name).to.equal('b');
        expect(jobs[2].name).to.equal('c');
        pail.deleteDir('job');
        done();
    });
});
