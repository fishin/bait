var Hatchery = require('hatchery');

var internals = {};

module.exports = internals.Test = function (settings) {

    internals.Test.settings = settings;
    this.getTestResult = exports.getTestResult;
};

exports.getTestResult = function(jobId, runId, artifact) {

    var hatchery = new Hatchery({ dirPath: internals.Test.settings.dirPath + '/' + jobId + '/' + runId });
    var result = hatchery.getTestResult(artifact);
    return result;
};