/**
 ** @Title          : bootweb/app.js
 ** @Description    : BootWeb apps Javascript Object
 ** @Authors        : BootWeb by the KaraCos Team  < http://www.karacos.org   >
 **                 : Cyril Gratecos               < cyril.gratecos@gmail.com >
 **                 : Nicolas Karageuzian          < nicolas@karageuzian.com  >
 ** @License        : The MIT License (MIT)
 ** @Copyright (c)  : <2014-2113> <The KaraCos Team>
 ** @Date           : 20140928
 ** @Version        : 0.1
 **/

var EventEmitter = require('events').EventEmitter
  , bootweb
     , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , NedbStore = require('connect-nedb-session')(session)
  , util = require('util');

/**
 * Main BootWeb app registry object, may emit events.
 * Used by bootweb to register applications.
 *
 * @param bw the bootweb object
 */
function AppRegistry(bw) {
  this.bootweb = bootweb = bw;
  this.log = require('log4js').getLogger('bootweb.appregistry');
  EventEmitter.call(null, this);
}

util.inherits(AppRegistry, EventEmitter);

AppRegistry.prototype.Apps = {};

/**
 *
 * @param cb
 */
AppRegistry.prototype.doCallBack = function (cb) {

  if (typeof cb === "function") {
    cb(null, this);
  }
}

/**
 * List Apps in registry
 *
 * @param app query filter, parent app object
 * @param callback with param list of apps
 */
AppRegistry.prototype.list = function (app, callback) {
  if (app.init != bootweb.express.application.init && typeof app === "function") {
    callback = app;
    app = undefined;
  }
  //TODO implements filter (Apps.map())
  if (typeof callback === "function") {
    return callback(null, this.Apps);
  } else {
    return this.Apps;
  }
};

/**
 * Get the app object for a given path
 * returns undefined if not exist
 *
 * @param path
 * @param callback (app)
 */
AppRegistry.prototype.get = function (path, callback) {
  if (callback) {
    return callback(null, this.Apps[path]);
  } else {
    return this.Apps[path];
  }
};

/**
 *
 * @param app
 * @param callback
 */
AppRegistry.prototype.status = function (app, callback) {
  this.doCallBack(callback);
};

/**
 *
 * @param app
 * @param server
 * @param callback
 */
AppRegistry.prototype.create = function (app, server, callback) {
  this.doCallBack(callback);
};

/**
 *
 * @param app
 * @param callback
 */
AppRegistry.prototype.delete = function (app, callback) {
  this.doCallBack(callback);
};

/**
 * Helper for configuring app with all bootweb defaults
 *
 * @param app
 * @param callback
 */
AppRegistry.prototype.wrapApp = function(app, callback) {
  app.bootweb = bootweb;
  app.set ( 'view engine', 'jade' );
  if (bootweb.conf.env === 'test' || bootweb.conf.env === 'dev') {
      // development error handler
      app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    } else {
      // production error handler
      app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: {}
        });
      });
    }
    app.isLoggedIn = function (req, res, next) {
      if (req.isAuthenticated())
        return next();
      res.redirect('/login');
    }


    app.use(bootweb.passport.initialize());
    app.use(bootweb.passport.session());
    app.use(session({secret: 'keyboard cat', cookie: { secure: false, maxAge: 900000 }, store: new NedbStore({ filename: process.env.BW_ROOT + '/servers/' + process.env.BW_SERVER + '/datas/sessions.db' }), resave: true, saveUninitialized: true}));

    app.use(cookieParser('keyboard cat'));

      // error handlers
  // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });
};

/**
 * Loads an app in the mount tree
 *
 * @param app object
 * @param path mount path for app
 * @param rootApp parent app
 * @param callback with params err, bootweb
 */
AppRegistry.prototype.load = function (app, path, rootApp, callback) {
  var apps = this;
  try {
    apps.wrapApp(app);
    apps.Apps[path] = app;
    rootApp.use(path, this.Apps[path]);
    if (callback) {
      return callback(null, bootweb);
    }
  } catch (e) {
    if (callback) {
      callback(e, bootweb);
    }
    apps.log.error("Impossible de monter l'application " + app + " at path : " + path);
    apps.log.debug(e);
  }
};

/**
 *
 * @param app
 * @param server
 * @param namespace
 * @param callback
 */
AppRegistry.prototype.unload = function (app, server, namespace, callback) {
  return;
};

/**
 *
 * @param app
 * @param callback
 */
AppRegistry.prototype.pack = function (app, callback) {
  return;
};

/**
 *
 * @param app
 * @param repo
 * @param callback
 */
AppRegistry.prototype.commit = function (app, repo, callback) {
  return;
};

/**
 *
 * @param app
 * @param repo
 * @param callback
 */
AppRegistry.prototype.pull = function (app, repo, callback) {
  return;
};

/**
 *
 * @param app
 * @param repo
 * @param callback
 */
AppRegistry.prototype.search = function (app, repo, callback) {
  return;
};

module.exports = AppRegistry;