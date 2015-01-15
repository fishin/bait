var Hoek = require('hoek');
var Utils = require('./utils');
var Runner = require('./runner');

var internals = {
    defaults: {
        config: 'config.json',
        workspace: 'workspace',
        dirPath: '/tmp/bait'
    }
};

module.exports = internals.Bait = function (options) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    var runner = new Runner(settings);
    var utils = new Utils(settings);
    this.Runner = runner;
    this.Utils = utils;
};
