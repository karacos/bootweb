'use strict';
require('./config');
var Bootweb = require("../bootweb");
// import the moongoose helper utilities

var utils = require('./utils');
var test = require('unit.js');
var request = require("request");
var should = require('should');
var cluster = require("cluster");
var bootweb = new Bootweb(cluster);

if ( cluster.isMaster === true ) {
describe("Bootweb core cluster mode", function () {

  describe("Worker", function () {
    //
    var bootweb = new Bootweb();
    it("should be an object", function () {
      bootweb.Worker.should.be.type('object');
    });
    it("should have init and run properties", function () {
      bootweb.Worker.should.have.property('init');
      bootweb.Worker.should.have.property('run');
    });
    describe(".init(process, app, callback)", function () {
      var app = require('express')();
      bootweb.Worker.init(bootweb, app, function (err, worker) {
        it("worker.app should match given app", function () {
          worker.app.should.match(function () {
            return app;
          });
        });
      });
    });
    describe(".init(process,callback)", function () {
      bootweb.Worker.init(bootweb, function (err, worker) {
        var bootweb = worker.bootweb;
        bootweb.conf.env = 'test';
        it("contains the conf object", function () {
          bootweb.conf.should.be.type('object');
        });
        it("set bootweb.conf.env String to 'test'", function () {
          (bootweb.conf.env).should.be.a.String;
          test.should(bootweb.conf.env == 'test')
        });
        it("contains the worker object", function () {
          bootweb.worker.should.be.type('object');
        });
        it("contains the apps registry", function () {
          var AppRegistry = require('../bootweb/apps');
          worker.apps.should.be.an.instanceOf(AppRegistry);
        });
        it("contains the http server", function () {
          worker.server.should.be.type('object');
        });
        it("contains the core app", function () {
          worker.app.should.be.type('function');
          worker.app.should.match(function () {
            return require('express')()
          });
        });

        describe("bootweb.apps", function () {
          describe(".load", function () {
            it("should be a function", function () {
              worker.apps.load.should.be.type("function");
            });

            describe("invoke with valid parameters", function () {
              var app = require("express")();
              describe("async call (with callback)", function () {
                it("should return no error", function (done) {
                  worker.apps.load(app, '/testcb', worker.app, function (err, bw) {
                    should.not.exist(err);
                    should.exist(bw);
                    done();
                  });
                });
              });
              describe("call with no callback", function () {
                it("should load app", function () {
                  worker.apps.load(app, '/testnocb', worker.app);
                  worker.apps.Apps['/testnocb'].should.equal(app);

                });
              });
            });
            describe("invoke with broken parameters", function () {
              it("should not raise exception", function () {
                worker.apps.load(null, "nopath", worker.app);
              });
            });
            describe("async invoke with broken parameters", function () {
              it("should return an error", function (done) {
                worker.apps.load(null, "nopath", worker.app, function (err, bw) {
                  should.exist(err);
                  done();
                });
              });
            });
          });
        });
        describe(".stop()", function () {
          it("should be a function", function () {
            worker.stop.should.be.type("function");
          });
        });
        describe(".run()", function () {
          it("should be a function", function () {
            worker.run.should.be.type("function");
          });
          describe("invoke with callback", function () {
            it("returns parameters with no error", function (done) {
              worker.run(function (err, worker) {
                should.not.exist(err);
                should.exist(worker);
                done();
              });
            });
            it('then listens on the specified port', function (done) {
              request('http://' + bootweb.conf.worker_address + ':' + bootweb.conf.worker_port, function (err, resp, body) {
                should.not.exist(err);
                resp.statusCode.should.be.type('number');
                done();
              });
            });
            it("and stops with worker.stop()", function (done) {
              worker.stop(function (err, worker) {
                should.not.exist(err);
                should.exist(worker);
                done();
              });
            });
            it("then doesn't listen", function (done) {
              request('http://' + bootweb.conf.worker_address + ':' + bootweb.conf.worker_port, function (err, resp, body) {
                should.exist(err);
                done();
              });
            });
          });
          describe("invoke twice", function () {
            it("first call returns parameters with no error", function (done) {
              worker.run(function (err, worker) {
                should.not.exist(err);
                should.exist(worker);
                done();
              });
            });
            it("second call returns fails", function (done) {
              worker.run(function (err, worker) {
                should.exist(err);
                should.exist(worker);
                done();
              });
            });
            it("stop all worker instances", function(done) {
              worker.stop(function (err, worker) {
                done();
              });
            });
          });
        });
      });
    });
  });
  describe("Master", function () {
    it("should be an object", function () {
      bootweb.Master.should.be.type('object');
    });
    it("should have init and run properties", function () {
      bootweb.Master.should.have.property('init');
      bootweb.Master.should.have.property('run');
    })
    describe(".init(process,callback) with bootweb given as arg", function () {
      bootweb.Master.init(bootweb, function (err, master) {
        var bootweb = master.bootweb;
        bootweb.conf.env = 'test';
        it("contains the conf object", function () {
          master.server.should.be.type('object');
        });
        it("set bootweb.conf.env String to 'test'", function () {
          (bootweb.conf.env).should.be.a.String;
          test.should(bootweb.conf.env == 'test');
        });
        it("contains the master object which should have Cluster as constructor", function (done) {
          bootweb.master.should.be.type('object');
          test.should(master.constructor.name.toString() == 'Cluster');
          done();
        });
        it("contains the http master", function () {
          master.server.should.be.type('object');
        });
        it("contains master app which is an instance of express ", function () {
          master.app.should.be.type('function');
          should(master.app.init === require('express').application.init).ok;
          master.app.should.match(function () {
            return require('express')()
          });
        });
        describe(".run()", function () {
          it("should be a function", function () {
            master.run.should.be.type("function");
          });
          describe("invoke with callback", function () {
            master.run(function (err, master) {
              it("returns parameters with no error", function (done) {
                should.not.exist(err);
                should.exist(master);
                done();
              });

              it("set bootweb.conf.cpuCount as an integer", function () {
                (bootweb.conf.cpuCount).should.be.an.Integer;
              });
              it("contains an array of process", function () {
                test.should(master.workers.constructor.name.toString() == 'Array');
                test.should(master.workers.length === (bootweb.conf.cpuCount + 1));

              });
              it("restarts a destroyed worker", function (done) {
                var worker1 = master.workers[0];
                master.workers[0].on('exit', function () {
                  var worker2 = master.workers[0];
                  test.should(master.workers.length === (bootweb.conf.cpuCount + 1));
                  test.should(worker2 != worker1);
                  done();
                });
                master.workers[0].kill();
              });
              it("stops gracefully, cleaning workers processes", function (done) {
                master.stop(function (err, worker) {
                  should.not.exist(err);
                  test.should(master.workers.length === 0);
                  done();
                });
              });
              it("restart after a stop", function (done) {
                master.run(function (err, worker) {
                  should.not.exist(err);
                  should.exist(master);
                  test.should(master.workers.length === (bootweb.conf.cpuCount + 1));
                  done();
                });
              });
              it("fails if started twice", function (done) {
                master.run(function (err, worker) {
                  should.exist(err);
                  should.exist(master);
                  done();
                });
              });
              it("stops then restarts with more CPU's (then stops)", function (done) {
                master.stop(function (err, worker) {
                  should.not.exist(err);
                  test.should(master.workers.length === 0);
                  bootweb.conf.cpuCount = 2;
                  master.run(function (err, worker) {
                    should.not.exist(err);
                    should.exist(master);
                    test.should(master.workers.length === 2);
                    master.stop(function (err, worker) {
                      test.should(master.workers.length === 0);
                      should.not.exist(err);
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

} else {
  bootweb.Worker.init ( bootweb, function(err, worker) {
   worker.bootweb.conf.env = 'test';
   if (err) {
      worker.bootweb.log.error("Worker init failed");
    } else {
      worker.run ();
    }
  } );
}
