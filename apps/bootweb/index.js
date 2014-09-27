var fs = require('fs')
  , path = require('path')
  , conf = require('../../lib/bootweb/config')
  , bootweb = require('../../lib/bootweb/bootweb')
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
    var logFile = fs.createWriteStream(conf.ROOT + '/server/default/logs/access.log', { flags: 'a' });

app.use(morgan('combined', {stream: logFile}));
app.use(express.static(path.join(conf.ROOT, 'lib', 'bootweb', 'public')));

app.use(cookieParser('keyboard cat'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({secret: 'keyboard cat', cookie: { secure: false, maxAge: 900000 }, store: new NedbStore({ filename: process.env.BW_ROOT + '/server/' + process.env.BW_SERVER + '/datas/sessions.db' }), resave: true, saveUninitialized: true})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', function (req, res) {
  res.send('Hello From Worker ') // TODO expose worker.id
});
// pourquoi ne pas faire ça dans lib/bootweb.js ?
for ( var application in bootweb.conf.namespace ) {
  var appCnf = bootweb.conf.namespace[application];
  console.log( "app path = " + application );
  console.log( "app name = " + appCnf );
  try {
    bootweb.apps[appCnf] = require('../' + appCnf);
    bootweb.onReady(function(bootweb) {
      app.use(application, bootweb.apps[appCnf]);
    });
    }
  catch(e) {
    console.log("Impossible de monter l'application " + appCnf); 
    console.log(e); 
    }
  }

module.exports = app;
