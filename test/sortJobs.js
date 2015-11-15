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

describe('sort jobs', () => {

    it('getJobs', (done) => {

        const jobDir = Path.join(internals.defaults.dirPath, 'job');
        const name = ['a', 'c', 'b'];
        const pail = new Pail(internals.defaults);
        pail.createDir('job');
        for (let i = 1; i < 4; ++i) {
            const id = '12345678-1234-1234-1234-12345678901' + i.toString();
            pail.createDir(Path.join('job', id));
            const config = {
                id: id,
                name: name[i - 1]
            };
            Fs.writeFileSync(Path.join(jobDir, id, 'config.json'), JSON.stringify(config));
        }
        const bait = new Bait({ dirPath: jobDir });
        const jobs = bait.getJobs();
        //console.log(jobs);
        expect(jobs.length).to.equal(3);
        expect(jobs[0].name).to.equal('a');
        expect(jobs[1].name).to.equal('b');
        expect(jobs[2].name).to.equal('c');
        pail.deleteDir('job');
        done();
    });
});
