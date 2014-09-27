/**
 * Bootweb worker
 *
 * can be used standalone in developpement mode
 **/


module.exports = {
  run: function (worker) {
      var bootweb = require('./bootweb')
      , log4js = require('log4js')
      , conf = require('./config')
    bootweb.worker = this ;
    bootweb.process = process;
    //TODO : conf driven logging
    log4js.loadAppender('file');
    log4js.addAppender(log4js.appenders.file(conf.ROOT + '/server/' + conf.SERVER + '/logs/bootweb.log'), 'bootweb');
    var logger = log4js.getLogger('worker');

    try {
      process.setgid(conf.worker_user);
      process.setuid(conf.worker_group);
    } catch (e) {
      logger.warn('Cannot set gid - not switching user');
    }
    process.title = 'BootWeb ' + conf.SERVER + ' WebWorker ' + worker.id;
    bootweb.start(function(bootweb) {
      logger.info('BootWeb Worker ' + worker.id + ' Started')
    });
  }
}
