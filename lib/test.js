var Hatchery = require('hatchery');
var Path = require('path');

var internals = {};

module.exports = internals.Test = function (settings) {

    internals.Test.settings = settings;
    this.getTestResult = exports.getTestResult;
};

exports.getTestResult = function (jobId, runId, artifact) {

    var hatchery = new Hatchery({ dirPath: Path.join(internals.Test.settings.dirPath, jobId, runId) });
    var result = hatchery.getTestResult(artifact);
    return result;
};
