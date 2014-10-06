/**
 * The BootWeb application Framework
 *
 * Copyright (c) 2014 The KaraCos Team
 * Licensed under The MIT License
 *
 * @author Nicolas Karageuzian <nicolas@karageuzian.com>
 * @author Cyril Gratecos <cyril@gratecos.net>
 */

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , WebSocketServer = require('ws').Server
  , path = require('path')
  , log4js = require('log4js')
  , passport = require("passport");

/**
 * Main library object, our bootweb may emit events
 * Initialize passport auth framework
 *
 */
function Bootweb(cluster) {
  EventEmitter.call(this);
  this.is_ready = false;
  this.cbs = [];
  this.wss = {};
  this.cluster = cluster !== undefined ? cluster : {worker: {id: 0}};
  this.Worker = require("./worker");
  this.Master = require("./master");
}

util.inherits(Bootweb, EventEmitter);

/**
 * Single event ready, direct callback call if emitted only once.
 *
 * @param callback
 * @returns {*}
 */
Bootweb.prototype.onReady = function (callback) {
  var bootweb = this;
  if (!bootweb.is_ready) {
    bootweb.cbs.push(callback);
  }
  else {
    return callback(bootweb);
  }
}

Bootweb.prototype.startApp = function(app, callback) {
  var bootweb = this;
  this.Worker.init(bootweb, app, function (err, worker) {
    if (err) {
      worker.log.error(err);
      if (typeof callback === "function") {
        return callback(err);
      }
    } else {
      worker.run(callback);
    }
  });
}

/**
 * Starts bootweb, configure basics, run onready callbacks then run callback
 *
 * @param callback function(err,bootweb)
 * @returns bootweb
 */
Bootweb.prototype.start = function (callback) {
  var bootweb = this;

  if (!bootweb.is_ready) {
    bootweb.conf = require('./config')(bootweb);
    bootweb.passport = require('./auth/passport')(passport);
    bootweb.express = require('express');
    bootweb.is_ready = true;
    bootweb.log.info("Bootweb is ready : " + bootweb)
    for (var x in this.cbs) {
      bootweb.cbs.pop()(bootweb);
    }
  }
  if (typeof callback === "function") {
    return callback(null, bootweb);
  }
}


module.exports = Bootweb;