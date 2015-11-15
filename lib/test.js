'use strict';

const Hatchery = require('hatchery');
const Path = require('path');

const internals = {};

module.exports = internals.Test = function (settings) {

    internals.Test.settings = settings;
    internals.Test.settings.getTestResult = exports.getTestResult;
    this.getTestResult = exports.getTestResult;
};

exports.getTestResult = function (jobId, runId) {

    const hatchery = new Hatchery({ dirPath: Path.join(internals.Test.settings.dirPath, jobId, runId) });
    const result = hatchery.getTestResult();
    return result;
};
