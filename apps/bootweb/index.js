var fs = require('fs')
  , path = require('path')
  , bootweb = require('../../bootweb')
  , conf = bootweb.conf
  , express = require("express")
  , app = express()
  , morgan = require('morgan')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , NedbStore = require('connect-nedb-session')(session)
  , cookieParser = require('cookie-parser')
  , flash = require('connect-flash')
  , passport = require('passport');

require('../login/lib/passport')(passport)// pass passport for configuration
//var logFile = fs.createWriteStream(conf.ROOT + '/servers/default/logs/access.log', { flags: 'a' });

//app.use(morgan('combined', {stream: logFile}));
app.use(express.static(__dirname + '/public'));

app.use(cookieParser('keyboard cat'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//app.use(session({secret: 'keyboard cat', cookie: { secure: false, maxAge: 900000 }, store: new NedbStore({ filename: process.env.BW_ROOT + '/servers/' + process.env.BW_SERVER + '/datas/sessions.db' }), resave: true, saveUninitialized: true})
//);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', function (req, res) {
  res.send('Hello From Worker ' + bootweb.worker.id)
});


module.exports = app;
