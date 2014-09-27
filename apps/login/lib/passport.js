// load all the things we need
var path              = require( 'path' )
  , log4js            = require( 'log4js' )
  , conf              = require(  '../../../lib/bootweb/config' )
  , pass               = require('./password')
  , LocalStrategy     = require( 'passport-local' ).Strategy;
//, FacebookStrategy = require( 'passport-facebook' ).Strategy
//, TwitterStrategy  = require( 'passport-twitter' ).Strategy
//, GoogleStrategy   = require( 'passport-google-oauth' ).OAuth2Strategy;

log4js.loadAppender( 'console' );
log4js.loadAppender( 'file' );
log4js.addAppender( log4js.appenders.file( conf.ROOT + '/server/' + conf.SERVER + '/logs/bootweb.log' ), 'passport' );
var logger = log4js.getLogger( 'passport' );
logger.setLevel( 'INFO' );
 
// load up the user model
var db            = require( '../models/index' );

// load the auth variables
var configAuth      = require( './auth' )// use this one for testing

module.exports = function( passport ) {

  // logger.debug(conf.ROOT);
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session
    
// used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    logger.debug('serializeUser -> '+user._id);
    done(null, user._id);
  });

// used to deserialize the user
  passport.deserializeUser(function(_id, done) {
    db.users.find({_id : _id}, function(err, user) {
      logger.debug('deserializeUser -> '+JSON.stringify(user));
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
    passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true// allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
  function(req, username, password, done) {
  // asynchronous
    process.nextTick(function() {
    //logger.debug( req );
      db.users.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          logger.debug('User '+username+' Not Found');
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        //return done(null, false, { message: 'Incorrect username.' });
        }
        if ( !pass.validate( user.password, password ) ) {
          logger.debug('User '+username+' Wrong Password');
          return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
        //return done(null, false, { message: 'Incorrect password.' });
        }
        logger.debug('User '+username+' Login Success.');
        return done(null, user);
      });
    });
  }));

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
    passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true// allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase()// Use lower-case e-mails to avoid case-sensitive e-mail matching

      // asynchronous
        process.nextTick(function() {
          // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                  // if there are any errors, return the error
                    if (err)
                        return done(err);

                  // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                      // create the user
                        var newUser            = new User();

                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }

                });
          // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
              // ...presumably they're trying to connect a local account
                var user            = req.user;
                user.local.email    = email;
                user.local.password = user.generateHash(password);
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            } else {
              // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));
/*
  ../ =========================================================================
  ../ FACEBOOK ================================================================
  ../ =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : tru../ allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

      ../ asynchronous
        process.nextTick(function() {

          ../ check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                      ../ if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user)../ user found, return that user
                    } else {
                      ../ if there is no user, create them
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
              ../ user already exists and is logged in, we have to link accounts
                var user            = req.user../ pull the user out of the session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    }));

  ../ =========================================================================
  ../ TWITTER =================================================================
  ../ =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : tru../ allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, tokenSecret, profile, done) {

      ../ asynchronous
        process.nextTick(function() {

          ../ check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                      ../ if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user)../ user found, return that user
                    } else {
                      ../ if there is no user, create them
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
              ../ user already exists and is logged in, we have to link accounts
                var user                 = req.user../ pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));

  ../ =========================================================================
  ../ GOOGLE ==================================================================
  ../ =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : tru../ allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

      ../ asynchronous
        process.nextTick(function() {

          ../ check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                      ../ if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = (profile.emails[0].value || '').toLowerCase()../ pull the first email

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = (profile.emails[0].value || '').toLowerCase()../ pull the first email

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
              ../ user already exists and is logged in, we have to link accounts
                var user               = req.user../ pull the user out of the session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = (profile.emails[0].value || '').toLowerCase()../ pull the first email

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });

    }));
*/
};