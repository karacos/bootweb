module.exports = function(app, passport) {

//* GET home page. */
  app.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
  });

  app.post('/',
    passport.authenticate('local-login', { successRedirect: '/test',
                                     failureRedirect: '/login',
                                     failureFlash: false })
  );

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  
};
