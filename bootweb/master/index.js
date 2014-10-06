/**
 * Bootweb worker
 *
 * can be used standalone in developpement mode
 **/

module.exports = {
  workers: new Array(),
  init: function (bootweb, callback) {
    var master = this
      , log4js = require('log4js');

    master.log = log4js.getLogger('bootweb.master');
    bootweb.master = master;
    master.bootweb = bootweb;
    bootweb.start(function () {

      master.app = bootweb.express();
      master.server = require('http').createServer(master.app);

      master.app.get('/', function (req, res) {
        res.send('Hello from master');
      });
      master.app.use(bootweb.express.static(__dirname + '/public'));
      process.title = 'BootWeb ' + process.env.BW_SERVER + ' Master';

      process.on('SIGINT', function () {
        master.log.info('BootWeb Master Stopped')
        process.exit();
      });

      process.on('SIGTERM', function () {
        master.log.info('BootWeb Master Stopped')
        process.exit();
      });
      if (callback) {
        callback(null, master);
      }
    });
  },
  run: function (callback) {
    var master = this
      , npid = require('npid')
      , bootweb = master.bootweb;
    if (!bootweb.cluster.isMaster)
      throw "not the master, unallowed";
    /**
     * recursive "restart worker" function
     */
    function startWorker() {
      var worker = bootweb.cluster.fork();
      master.workers.push(worker);
      worker.on('exit', function (code, signal) {
        master.log.info('BootWeb Worker ' + worker.id + ' Stopped on SIGNAL ' + signal);
        master.workers.splice(master.workers.indexOf(worker), 1);
        startWorker();
      });
    }

    try {
      master.pid = npid.create(bootweb.conf.server_dir + '/run/bootweb.pid');
      master.pid.removeOnExit();
    } catch (err) {
      master.log.error(err);
      if (typeof callback === "function") {
        return callback(err, master);
      }
      throw err;
    }
    // Count the machine's CPUs
    if (bootweb.conf.env === 'test') {
      master.log.info("env TEST enabled, fork one process");
      bootweb.conf.cpuCount = 0;
    } else {
      master.log.info("env :" + bootweb.conf.env);
      bootweb.conf.cpuCount = require('os').cpus().length;
    }
    // Calls a recursive worker restart for each CPU
    for (var i = 0; i <= bootweb.conf.cpuCount; i++) {
      startWorker();
    }
    var onListen = function() {
      master.log.info('BootWeb Master Started ' + bootweb.conf.master_address + ":" + bootweb.conf.master_port);
      if (typeof callback === "function") {
        return callback(null, master);
      }
    }

    bootweb.onReady(function () {
      master.server.once('listening', onListen);
      master.server.listen(bootweb.conf.master_port, bootweb.conf.master_address);
    });
  },
  stop: function (callback) {
    var master = this
      , bootweb = master.bootweb;
    try {
      master.pid.remove();
      for (id in bootweb.cluster.workers) {
        bootweb.cluster.workers[id].removeAllListeners();
        bootweb.cluster.workers[id].kill();
        delete bootweb.cluster.workers[id];
      }
      master.server.close();
        if (typeof callback === "function") {
          return callback(null, master);
        }

    } catch (e) {
      master.log.error(e);
      if (typeof callback === "function") {
        callback(e, master);
      }
    }
  }
}
