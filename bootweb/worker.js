/**
 * Bootweb worker
 *
 * can be used standalone in developpement mode
 **/
var AppRegistry = require('./apps')

module.exports = {

  init: function (bootweb, app, callback) {
    var worker = this;
    if (bootweb.cluster.isMaster)
      throw "not a worker, unallowed";
    if (typeof app === "function" && callback === undefined) {
      callback = app;
      app = undefined;
    }
    worker.apps = new AppRegistry(bootweb);
    bootweb.worker = worker;
    worker.id = bootweb.cluster.worker.id;
    bootweb.start(function (err, bootweb) {
      var log4js = require('log4js');
      worker.bootweb = bootweb;
      worker.log = log4js.getLogger('bootweb.worker ' + worker.id);
      if (app !== undefined) {
        worker.app = app;
      } else {
        worker.app = require('../apps/bootweb');
      }
      require("./auth/routes")(worker.app, bootweb.passport);
      for (var path in bootweb.conf.namespace) {
        var appName = bootweb.conf.namespace[path];
        worker.log.info("app path = " + path);
        worker.log.info("app name = " + appName);
        worker.apps.load(require(appName), path, worker.app);
      }
      worker.apps.wrapApp(worker.app);
      worker.server = require('http').createServer(worker.app);
      process.title = 'BootWeb ' + bootweb.conf.SERVER + ' Worker ' + bootweb.cluster.worker.id;
      try {
        process.setgid(bootweb.conf.worker_user);
        process.setuid(bootweb.conf.worker_group);
      } catch (e) {
        worker.log.warn('Cannot set gid - not switching user');
      }
      worker.log.info('BootWeb Worker ' + bootweb.cluster.worker.id + ' Started');
      if (callback) {
        return callback(null, worker);
      }
    });
  },
  run: function (callback) {
    var worker = this
      , bootweb = worker.bootweb;
    bootweb.onReady(function (bootweb) {
      try {
        worker.server.once('listening', function(){
          worker.log.info("Start listening on " + bootweb.conf.worker_address + ":" + bootweb.conf.worker_port);
        });
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
