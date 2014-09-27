/**
 ** @Name           : bootweb/servers.js
 ** @Description    : BootWeb servers Javascript Object
 ** @Authors        : BootWeb by the KaraCos Team  < http://www.karacos.org   >
 **                 : Cyril Gratecos               < cyril.gratecos@gmail.com >
 **                 : Nicolas Karageuzian          < nicolas@karageuzian.com  >
 ** @License        : The MIT License (MIT)
 ** @Copyright (c)  : <2014-2113> <The KaraCos Team>
 ** @Date           : 20140928
 ** @Version        : 0.1
 **/

var EventEmitter = require ( 'events' ).EventEmitter
  , bootweb = require ( './' )
  , path = require ( 'path' )
  , util = require ( 'util' );

/**
 * Main BootWeb servers object, may emit events
 */
function servers () {
  EventEmitter.call ( this );
}

function doCallBack (cb) {
  if ( cb !== undefined ) {
    return cb ( bootweb );
  }
}

util.inherits ( bootweb, EventEmitter );


/**
 *
 * @param path
 * @param callback
 */
servers.prototype.list = function (path, callback) {
  return;
};

/**
 *
 * @param path
 * @param callback
 */
servers.prototype.create = function (path, callback) {
  return;
};

/**
 *
 * @param path
 * @param callback
 */
servers.prototype.start = function (path, callback) {
  var cluster = require ( 'cluster' );
};

/**
 *
 * @param path
 * @param callback
 */
servers.prototype.stop = function (path, callback) {
  return;
};

/**
 *
 * @param path
 * @param callback
 */
servers.prototype.status = function (path, callback) {
  return;
};

/**
 *
 * @param path
 * @param callback
 */
servers.prototype.monitor = function (path, callback) {
  return;
};

/**
 *
 * @param path
 * @param callback
 */
servers.prototype.backup = function (path, callback) {
  return;
};

module.exports = new servers ();