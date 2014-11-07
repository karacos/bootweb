var app = require('express')()
  , Bootweb = require('../bootweb');

var utils = require('./utils');
var test = require('unit.js');
var request = require("request");
var should = require('should');
var cluster= require('cluster');
if ( cluster.isMaster === true ) {
  var bootweb = new Bootweb();
  app.get('/', function(req,res){res.send("Home")});
  bootweb.startApp(app, function (err, worker) {
      describe("standalone startApp", function () {
        it("start nicely an app", function () {
          should.not.exist(err);
          should.exist(worker);
        });

    worker.server.once('listening', function(){
        it('which listen on port', function (done) {
          request('http://' + bootweb.conf.worker_address + ':' + bootweb.conf.worker_port, function (err, resp, body) {
            should.not.exist(err);
            resp.statusCode.should.be.exactly(200);
            done();
          });
        });
        it("invoke stop", function (done) {
          worker.stop(function (err, worker) {
            should.not.exist(err);
            should.exist(worker);
            done();
          });
        });
        it("it stops listening", function (done) {
          request('http://' + bootweb.conf.worker_address + ':' + bootweb.conf.worker_port, function (err, resp, body) {
            should.exist(err);
            done();
          });
        });
      });
    });
  });
}