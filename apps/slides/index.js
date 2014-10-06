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

var logger = log4js.getLogger('slides');
logger.setLevel('DEBUG');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(sharejs.scriptsDir));
//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler






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
