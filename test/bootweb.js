'use strict';
require('./config');
var master = require('../bootweb/master');
var worker = require('../bootweb/worker');
// import the moongoose helper utilities
var utils = require('./utils');
var test = require('unit.js');
var request = require("request");
var should = require('should');

describe("Bootweb core", function () {
  describe("Worker", function () {
    it("should be an object", function () {
      worker.should.be.type('object');
    });
    it("should have init and run properties", function () {
      worker.should.have.property('init');
      worker.should.have.property('run');
    });
    describe(".init(process, app, callback)", function () {
      var app = require('express')();
      worker.init({worker: {id: 0}}, app, function (err, worker) {
        it("worker.app should match given app", function() {
          worker.app.should.match(function(){
            return app;
          });
        });
      });
    });
    describe(".init(process,callback)", function () {
      worker.init({worker: {id: 0}}, function (err, worker) {
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
                resp.statusCode.should.be.exactly(200);
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
          });
        });
      });
    });
  });
  describe("Master", function () {
    it("should be an object", function () {
      master.should.be.type('object');
    });
    it("should have init and run properties", function () {
      master.should.have.property('init');
      master.should.have.property('run');
    })
    describe(".init(process,callback) with bootweb given as arg", function () {
      master.init(require('cluster'), function (err, master) {
        var bootweb = master.bootweb;
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
            it("returns parameters with no error", function (done) {
              master.run(function (err, master) {
                should.not.exist(err);
                should.exist(master);
                done();
              });
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
                    should.not.exist(err);
                    test.should(master.workers.length === 0);
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
