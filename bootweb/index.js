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
  , WebSocketServer = require('ws').Server;

/**
 * Main library object, our bootweb may emit events
 */
function Bootweb() {
  EventEmitter.call(this);
  this.is_ready = false;
  this.cbs = [];
  this.wss = {};
}

util.inherits(Bootweb, EventEmitter);


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
 * Starts bootweb, configure basics, run onready callbacks then run callback
 *
 * @param callback function(err,bootweb)
 * @returns bootweb
 */
Bootweb.prototype.start = function (callback) {
  var bootweb = this;

  if (!bootweb.is_ready) {
    bootweb.conf = require('./config')(bootweb);
    bootweb.express = require('express');
    bootweb.is_ready = true;
    for (var x in this.cbs) {
      bootweb.cbs[x](bootweb);
      delete bootweb.cbs[x];
    }
    if (typeof callback === "function") {
      callback(null, bootweb);
    }
  }
  if (typeof callback === "function") {
    callback(null, bootweb);
  }
}


module.exports = new Bootweb();