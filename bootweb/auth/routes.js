module.exports = function(app, passport) {

//* POST home page. */

  app.post('auth/', function(req, res, next) {
      var forward = "/";
      if (req.param('forward')) {
        forward = req.param('forward');
      }
      passport.authenticate('local-login', {
        successRedirect: forward,
        failureRedirect: '/login',
        failureFlash: false }
      )(req,res,next);
    }
  );

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  
};
