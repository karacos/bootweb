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
  , log4js = require('log4js');

/**
 * Main library object, our bootweb may emit events
 */
function Bootweb() {
  EventEmitter.call(this);
}

util.inherits(Bootweb, EventEmitter);

Bootweb.prototype.is_ready = false;
Bootweb.prototype.conf = require('./config');
Bootweb.prototype.servers = require('./servers');
Bootweb.prototype.cbs = [];
Bootweb.prototype.wss = {};

/**
 * shortcut for Bootweb callbacks invocation
 *
 * @param cb callback to run with argument Bootweb (this)
 */
Bootweb.prototype.doCallBack = function (cb) {
  var bootweb = this;
  if (cb !== undefined) {
    cb(bootweb);
  }
}

/**
 * Single event ready, direct callback call if emitted only once.
 *
 * @param callback
 * @returns {*}
 */
Bootweb.prototype.onReady = function (callback) {
  if (this.is_ready == false) {
    this.cbs.push(callback);
  }
  else {
    return callback(this);
  }
}

/**
 * Starts bootweb, configure basics, run onready callbacks then run callback (param)
 *
 * @param callback
 * @returns bootweb
 */
Bootweb.prototype.start = function (callback) {
  var bootweb = this;
  if (!bootweb.is_ready) {
    bootweb.server_dir = bootweb.conf.ROOT + '/servers/' + bootweb.conf.SERVER;
    log4js.configure(bootweb.server_dir + '/etc/log4js.json', { reloadSecs: 300, cwd: bootweb.server_dir + '/logs'});
    bootweb.log = log4js.getLogger("bootweb");
    bootweb.express = require('express');
    bootweb.is_ready = true;
    for (var x in this.cbs) {
      bootweb.cbs[x](bootweb);
      delete bootweb.cbs[x];
    }
    if (typeof callback === "function") {
      callback(null, bootweb);
    }
  } else {
    if (typeof callback === "function") {
      callback(null, bootweb);
    }
  }
}


module.exports = new Bootweb();