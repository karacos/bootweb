var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , WebSocketServer = require('ws').Server

var bootweb = function () {
  EventEmitter.call(this);
}

util.inherits(bootweb, EventEmitter);

bootweb.prototype.is_ready = false;
bootweb.prototype.conf = require('./config');
bootweb.prototype.cbs = [];
bootweb.prototype.apps = {};
bootweb.prototype.wss = {};
bootweb.prototype.onReady = function (callback) {
  if (this.is_ready == false) {
    this.cbs.push(callback);
  }
  else {
    return callback(this);
  }
}
bootweb.prototype.start = function (callback) {
  this.app = require('../../apps/bootweb');
  this.server = require('http').createServer(this.app);
  this.server.listen(this.conf.listen_port, this.conf.listen_address);
  var bootweb = this;
  for (var x in this.cbs) {
    this.cbs[x](this);
    delete this.cbs[x];
  }
  this.is_ready = true;
  callback(this);
}

module.exports = new bootweb();
