var internals = {
    queue: []
};

module.exports = internals.Queue = function (options) {

    this.settings = options;
    internals.Queue.settings = options;
    internals.Queue.removeJob = exports.removeJob;
    this.addJob = exports.addJob;
    this.removeJob = exports.removeJob;
    this.getQueue = exports.getQueue;
    this.startQueue = exports.startQueue;
    this.stopQueue = exports.stopQueue;
};

exports.addJob = function (jobId) {

    // make sure jobId doesnt already exist
    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId) {
            console.log(jobId + ' already in queue');
            return null;
        }
    }
    var queueTime = new Date().getTime();
    var queue = {
        jobId: jobId,
        queueTime: queueTime
    };
    internals.queue.push(queue);
    return null;
};

exports.removeJob = function (jobId) {

    for (var i = 0; i < internals.queue.length; i++) {
        if (internals.queue[i].jobId === jobId) {
            internals.queue.splice(i, 1);
        }
    }
    return null;
};

exports.getQueue = function () {

    var queue = [];
    for (var i = 0; i < internals.queue.length; i++) {
        var now = new Date().getTime();
        var shortId = internals.queue[i].jobId.split('-')[0];
        var elapsedTime = now - internals.queue[i].queueTime;
        var job = {
            jobId: internals.queue[i].jobId,
            queueTime: internals.queue[i].queueTime,
            shortId: shortId,
            elapsedTime: elapsedTime
        };
        queue.push(job);
    }
    return queue;
};

exports.startQueue = function () {

    var queueObj = setInterval(function () {

        //console.log('checking queue');
        if (internals.queue.length > 0) {
            var jobId = internals.queue[0].jobId;
            //console.log('checking activeRuns');
            var jobs = internals.Queue.settings.getActiveJobs();
            //console.log(jobs);
            if (!jobs[jobId]) {
                internals.Queue.settings.startJob(jobId);
                internals.Queue.removeJob(jobId);
            }
            //else {
            //    console.log('jobRunning');
            //}
        }
    }, 1000);
    return queueObj;
};

exports.stopQueue = function (queueObj) {

    clearInterval(queueObj);
    return;
};
