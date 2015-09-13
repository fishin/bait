var Hatchery = require('hatchery');
var Path = require('path');

var internals = {};

module.exports = internals.Test = function (settings) {

    internals.Test.settings = settings;
    internals.Test.settings.getTestResult = exports.getTestResult;
    this.getTestResult = exports.getTestResult;
};

exports.getTestResult = function (jobId, runId) {

    var hatchery = new Hatchery({ dirPath: Path.join(internals.Test.settings.dirPath, jobId, runId) });
    var result = hatchery.getTestResult();
    return result;
};
