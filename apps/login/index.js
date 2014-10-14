var express = require ( 'express' )
  , path = require ( 'path' )
  , logger = require ( 'morgan' )
  , session = require ( 'express-session' )
  , bodyParser = require ( 'body-parser' )
  , NedbStore = require ( 'connect-nedb-session' ) ( session )
  , cookieParser = require ( 'cookie-parser' );

var app = express ()
  , passport = require ( 'passport' )
  , flash = require ( 'connect-flash' )
  , db = require ( './models' )
  , pass = require ( './password' )
  , LocalStrategy = require ( 'passport-local' ).Strategy
  , log4js = require ( 'log4js' );

require ( './lib/passport' ) ( passport )// pass passport for configuration



var logger = log4js.getLogger ( 'login' );
logger.setLevel ( 'DEBUG' );


// view engine setup
app.set ( 'views', path.join ( __dirname, 'views' ) );
app.set ( 'view engine', 'jade' );

app.use ( cookieParser ( 'keyboard cat' ) );
app.use ( bodyParser.json () );
app.use ( bodyParser.urlencoded ( {
                                    extended: true
                                  } ) );

app.use ( session ( {secret: 'keyboard cat', cookie: { secure: false, maxAge: 900000 }, store: new NedbStore ( { filename: process.env.BW_ROOT + '/servers/' + process.env.BW_SERVER + '/datas/sessions.db' } ), resave: true, saveUninitialized: true} )
)
app.use ( passport.initialize () );
app.use ( passport.session () );
app.use ( flash () );
app.use ( express.static ( path.join ( __dirname, 'public' ) ) );

// routes ======================================================================
require ( './routes' ) ( app, passport )// load our routes and pass in our app and fully configured passport

// catch 404 and forward to error handler
app.use ( function (req, res, next) {
  var err = new Error ( 'Not Found' );
  err.status = 404;
  next ( err );
} );

// development error handler
// will print stacktrace
if ( app.get ( 'env' ) === 'development' ) {
  app.use ( function (err, req, res, next) {
    res.status ( err.status || 500 );
    res.render ( 'error', {
      message: err.message,
      error: err
    } );
  } );
}

// production error handler
// no stacktraces leaked to user
app.use ( function (err, req, res, next) {
  res.status ( err.status || 500 );
  res.render ( 'error', {
    message: err.message,
    error: {}
  } );
} );

app.isLoggedIn = function (req, res, next) {
  if ( req.isAuthenticated () )
    return next ();
  res.redirect ( '/login' );
}

module.exports = app;
