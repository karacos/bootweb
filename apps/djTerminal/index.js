var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect')
  , pty = require('pty.js')
  , terminal = require('term.js');
  
/**
 * Open Terminal
**/
var stream;
var buff = []
  , socket
  , term;

term = pty.fork(process.env.SHELL || 'sh', [], {
  name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
    ? 'xterm-256color'
    : 'xterm',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME
});

term.on('data', function(data) {
  if (stream) stream.write('OUT: ' + data + '\n-\n');
  return !socket
    ? buff.push(data)
    : socket.emit('data', data);
});

console.log(''
  + 'Created shell with pty master/slave'
  + ' pair (master: %d, pid: %d)',
  term.fd, term.pid);

/**
 * App & Server
**/
var express = require('express');
var app = express();
var server = require('http').createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));

app.use(cookieParser());

app.use(function(req, res, next) {
  var setHeader = res.setHeader;
  res.setHeader = function(name) {
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

app.use(basicAuth(function(user, pass, next) {
  if (user !== 'foo' || pass !== 'bar') {
    return next(true);
  }
  return next(null, user);
}));

app.use(express.static(__dirname));
app.use(terminal.middleware());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
/**
 * Socketsa
**/

app.on('listen', function() {
  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function(sock) {
    socket = sock;

    socket.on('data', function(data) {
      console.log(data);
      if (stream) stream.write('IN: ' + data + '\n-\n');
        term.write(data);
      });

    socket.on('disconnect', function() {
      socket = null;
    });

    while (buff.length) {
      socket.emit('data', buff.shift());
    }
  })
})



module.exports = app;
