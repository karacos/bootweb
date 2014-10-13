/**
 * term.js
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * Enchanced for BootWeb by the KaraCos Team Copyright (c) 2012-2113 (MIT License)
 */

var bootweb = require('../../bootweb')
  , basicAuth = require('basic-auth')
  , express = require('express')
  , io = require('socket.io')
  , pty = require('pty.js')
  , terminal = require('term.js');


/**
 * Dump


 var stream;
 if (process.argv[2] === '--dump') {
  stream = require('fs').createWriteStream(__dirname + '/dump.log');
}

 /**
 * Open Terminal
 */

var buff = []
  , socket
  , term = null;


/**
 * App & Server
 */

var app = express();

app.set('name', 'terminal');

var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };
  var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }
  if (user.name === 'foo' && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  }
};

app.use(function (req, res, next) {
  if (term == null) {
    // ici attention, il faudrait forker 'login' au lieu de shell, mais en tant que root (donc avec le master process)
    //term = pty.fork(process.env.SHELL || 'sh', [], {
    term = pty.fork('login', [], {
      name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
        ? 'xterm-256color'
        : 'xterm',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME
    });

     // tant qu'à faire, stocker ces var locales dans un registre du master process
    // pour faire de la maintenance (kill de process, gestion timeout) depuis la console bootweb par exemple
    var pid = term.pid;
    var fd = term.fd;

    term.on('data', function (data) {
      //if (stream) stream.write('OUT: ' + data + '\n-\n');
      return !socket
        ? buff.push(data)
        : socket.emit('data', data);
    });

    term.on('exit', function () {
      console.log(
          'Killed shell with pty master/slave'
          + ' pair (master: %d, pid: %d)',
        fd, pid);
    });

    console.log(
        'Created shell with pty master/slave'
        + ' pair (master: %d, pid: %d)',
      term.fd, term.pid);
  }

  /**
     * Sockets
     */


  // à factoriser dans une fonction bootweb.getWss(app, callback){return callback(io);} dans lib/bootweb.js
  if (bootweb.wss[app.get('name')] === undefined) {
    bootweb.wss[app.get('name')] = io.listen(bootweb.server, {
      log: false
    });
    io = bootweb.wss[app.get('name')];
 // fin de factorisation, ce qui nous laisserai la seule ligne :
//bootweb.getWss(app, function(io) {
    io.sockets.on('connection', function (sock) {
      socket = sock;

      socket.on('data', function (data) {
        //if (stream) stream.write('IN: ' + data + '\n-\n');
        if (term != null) {
          term.write(data);
        }
      });

      socket.on('disconnect', function () {
        if (term != null) {
          term.kill('SIGHUP');
        }
        term = null;
        socket = null;
      });

      while (buff.length) {
        socket.emit('data', buff.shift());
      }
    });

  }
  next();
});

app.use(function (req, res, next) {
  var setHeader = res.setHeader;
  res.setHeader = function (name) {
    switch (name) {
      case 'Cache-Control':
      case 'Last-Modified':
      case 'ETag':
        return;
    }
    return setHeader.apply(res, arguments);
  };
  next();
});


app.use(express.static(__dirname + '/public'));
app.use(terminal.middleware());


module.exports = app;
