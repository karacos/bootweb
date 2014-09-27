/**
 * Created by nico on 12/09/14.
 */
//!../../bin/node-v0.10.26-linux-x64/bin/node

// Include the cluster module
var cluster = require('cluster')
  , fs = require('fs')
  , path = require('path')
  , conf = require('./config')
  , log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(conf.ROOT + '/server/' + conf.SERVER + '/logs/bootweb.log'), 'bootweb');
var logger = log4js.getLogger('bootweb');


// Code to run if we're in the master process
if (cluster.isMaster) {

  var npid = require('npid')
    , messageHandler = require('./messageHandler');

//console.log(conf);

  process.title = 'BootWeb ' + process.env.BW_SERVER + ' Master';

  process.on('SIGINT', function () {
    logger.info('BootWeb Master Stopped')
    process.exit();
  });

  process.on('SIGTERM', function () {
    logger.info('BootWeb Master Stopped')
    process.exit();
  });

  try {
    var pid = npid.create(conf.ROOT + '/server/' + conf.SERVER + '/run/bootweb.pid');
    pid.removeOnExit();
  } catch (err) {
    console.log(err);
    logger.info(err)
    process.exit(1);
  }
  ;

// Count the machine's CPUs
  //var cpuCount = require('os').cpus().length;
  var cpuCount = 0;
  logger.info('BootWeb Master Started')

// Create a worker for each CPU
  for (var i = 0; i <= cpuCount; i += 1) {
    var worker = cluster.fork();
    worker.on('message', messageHandler);
    worker.on('exit', function (code, signal) {
      logger.info('BootWeb Worker ' + worker.id + ' Stopped on SIGNAL ' + signal)
      cluster.fork();
    });
  };

// Code to run if we're in a worker process
} else {
  require('./worker').run(cluster.worker);
}
