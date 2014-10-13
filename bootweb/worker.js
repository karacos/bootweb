/**
 * Bootweb worker
 *
 * can be used standalone in developpement mode
 **/
var AppRegistry = require('./apps')

module.exports = {

  init: function (cluster, callback) {
    var bootweb = require('./')
      , log4js = require('log4js')
      , worker = this;
    worker.apps = new AppRegistry(bootweb);
    worker.log = log4js.getLogger('bootweb.worker ' + cluster.worker.id);
    bootweb.worker = cluster.worker;
    worker.bootweb = bootweb;
    bootweb.start(function () {
      worker.app = require('../apps/bootweb');
      worker.server = require('http').createServer(worker.app);
      for (var path in bootweb.conf.namespace) {
        var appName = bootweb.conf.namespace[path];
        worker.log.info("app path = " + path);
        worker.log.info("app name = " + appName);
        worker.apps.load(require(appName), path, worker.app);
      }
      process.title = 'BootWeb ' + bootweb.conf.SERVER + ' Worker ' + cluster.worker.id;
      try {
        process.setgid(bootweb.conf.worker_user);
        process.setuid(bootweb.conf.worker_group);
      } catch (e) {
        worker.log.warn('Cannot set gid - not switching user');
      }
      worker.log.info('BootWeb Worker ' + cluster.worker.id + ' Started');
      if (callback) {
        callback(null, worker);
      }
    });
  },
  run: function (callback) {
    var worker = this
      , bootweb = worker.bootweb;
    bootweb.onReady(function () {
      try {
        worker.server.listen(bootweb.conf.worker_port, bootweb.conf.worker_address);
        if (typeof callback === "function") {
          return callback(null, worker);
        }
      } catch (e) {
        if (typeof callback === "function") {
          return callback(e, worker);
        }
        worker.log.fatal(e);
        throw e;
      }
    });
  },
  stop: function (callback) {
    var worker = this
      , bootweb = worker.bootweb
    try {
      worker.server.close(function (err) {
        if (typeof callback === "function") {
          callback(err, worker);
        }
      });
    } catch (e) {
      if (typeof callback === "function") {
        callback(e, worker);
      }
    }
  }
}
