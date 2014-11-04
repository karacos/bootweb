/**
 * Bootweb worker
 *
 * can be used standalone in developpement mode
 **/
var AppRegistry = require('./apps')

module.exports = {

  init: function (cluster, app, callback) {
    var bootweb = require('./')
      , worker = this;
    if (typeof app === "function" && callback === undefined) {
      callback = app;
      app = undefined;
    }
    worker.apps = new AppRegistry(bootweb);
    bootweb.cluster = cluster;
    bootweb.worker = worker;
    worker.id = cluster.worker.id;
    bootweb.start(function (err, bootweb) {
      var log4js = require('log4js');
      worker.bootweb = bootweb;
      worker.log = log4js.getLogger('bootweb.worker ' + worker.id);
      if (app !== undefined) {
        worker.app = app;
      } else {
        worker.app = require('../apps/bootweb');
        }
      //require("./auth/routes")(worker.app,bootweb.passport);
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
        return callback(null, worker);
      }
    });
  },
  run: function (callback) {
    var worker = this
      , bootweb = worker.bootweb;
    bootweb.onReady(function () {
      try {
        worker.log.info("Start listening on " + bootweb.conf.worker_port + " " + bootweb.conf.worker_address)
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
          return callback(err, worker);
        }
      });
    } catch (e) {
      if (typeof callback === "function") {
        return callback(e, worker);
      }
    }
  }
}
