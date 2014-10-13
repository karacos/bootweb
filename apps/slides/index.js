var express = require('express')
  , path = require('path')
  , logger = require('morgan')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , NedbStore = require('connect-nedb-session')(session)
  , cookieParser = require('cookie-parser');

var app = express()
  , passport = require('passport')
  , flash = require('connect-flash')
  , pass = require('../login/password')
  , LocalStrategy = require('passport-local').Strategy
  , log4js = require('log4js');
  //, bootweb = require('bootweb');

Duplex = require('stream').Duplex;
livedb = require('livedb');
//livedbMongo = require('livedb-mongo');
http = require('http');
var livedbmongo = require('livedb-mongo');
sharejs = require('share');
var mongo = livedbmongo('mongodb://localhost:27017/share?auto_reconnect', {safe:true});
backend = livedb.client(mongo);;

share = sharejs.server.createClient({
  backend: backend
});

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(process.env.BW_ROOT + '/servers/default/logs/bootweb.log'), 'login')

var logger = log4js.getLogger('login');
logger.setLevel('DEBUG');


app.set('env', 'development');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(cookieParser('keyboard cat'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({secret: 'keyboard cat', cookie: { secure: false, maxAge: 900000 }, store: new NedbStore({ filename: process.env.BW_ROOT + '/servers/' + process.env.BW_SERVER + '/datas/sessions.db' }), resave: true, saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(sharejs.scriptsDir));
//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler

// error handlers
require('../login/passport')(passport)// pass passport for configuration
require('./routes')(app, passport)// load our routes and pass in our app and fully configured passport

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}
app.bwinit = function (bootweb) {
  bootweb.wss.on('connection', function (client) {
    var stream;
    stream = new Duplex({
      objectMode: true
    });
    stream._write = function (chunk, encoding, callback) {
      console.log('s->c ', chunk);
      client.send(JSON.stringify(chunk));
      return callback();
    };
    stream._read = function () {
    };
    stream.headers = client.upgradeReq.headers;
    stream.remoteAddress = client.upgradeReq.connection.remoteAddress;
    client.on('message', function (data) {
      console.log('c->s ', data);
      return stream.push(JSON.parse(data));
    });
    stream.on('error', function (msg) {
      return client.close(msg);
    });
    client.on('close', function (reason) {
      stream.push(null);
      stream.emit('close');
      console.log('client went away');
      return client.close(reason);
    });
    stream.on('end', function () {
      return client.close();
    });
    return share.listen(stream);
  });
}


module.exports = app;
