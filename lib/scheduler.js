var Cron = require('cron');
var Pail = require('pail');

var Job = require('./job');

var internals = {
    jobs: []
};

module.exports = internals.Scheduler = function(options) {

    this.settings = options;
    this.initializeScheduler = exports.initializeScheduler;
    this.addSchedule = exports.addSchedule;
    this.getSchedules = exports.getSchedules;
    this.getSchedule = exports.getSchedule;
    this.removeSchedule = exports.removeSchedule;

    internals.Scheduler.settings = options;
    internals.Scheduler.addSchedule = exports.addSchedule;
    internals.Scheduler.getSchedule = exports.getSchedule;
};

exports.initializeScheduler = function() {

    //console.log('initializing scheduler');
    var pail = new Pail({ dirPath: internals.Scheduler.settings.dirPath});
    var jobs = pail.getPails();
    var fullJobs = [];
    for (var i = 0; i < jobs.length; i++) {
        var job = pail.getPail(jobs[i]);
        fullJobs.push(job);
    }
    for (var i = 0; i < fullJobs.length; i++) {
        if (fullJobs[i].schedule && fullJobs[i].schedule.type === 'cron' ) {
            var jobId = fullJobs[i].id;
            internals.Scheduler.addSchedule(jobId);
        }
    }
};

exports.getSchedule = function(jobId) {

    for (var i = 0; i < internals.jobs.length; i++) {
        if (internals.jobs[i].jobId === jobId) {
            return internals.jobs[i].schedule;
        }
    }
    return null;
};

exports.getSchedules = function() {

    return internals.jobs;
};

exports.removeSchedule = function(jobId) {
 
    var schedule = internals.Scheduler.getSchedule(jobId);
    console.log('stopping schedule for jobId: ' + jobId);
    //console.log(schedule);
    if (schedule) {
        schedule.stop();
        for (var i = 0; i < internals.jobs.length; i++) {
            if (internals.jobs[i].jobId === jobId) {
                internals.jobs.splice(i, 1);
            }
        }
    }
};
 
exports.addSchedule = function(jobId) {

    console.log('adding schedule job: ' + jobId);
    var pail = new Pail({ dirPath: internals.Scheduler.settings.dirPath });
    var scheduleJob = pail.getPail(jobId);
    console.log('scheduling new job for jobid: ' + jobId);
    var schedule = new Cron.CronJob({
        cronTime: scheduleJob.schedule.pattern,
        //cronTime: "* * * * *",
        onTick: function() {
            console.log('tick');
            //var job = new Job(internals.Scheduler.settings);
            //job.startJob(jobId);
        },
        start: true
    });
    internals.jobs.push({ jobId: jobId, schedule: schedule });
    //console.log(internals.jobs);
};
