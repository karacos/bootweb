var Datastore = require('nedb')
  , password = require('./password')
  , path = require('path')
  , db
  , log4js = require('log4js');




module.exports = {
  db: db,
  init: function(bootweb) {
    bootweb.onReady(function(bootweb){
  db = new Datastore({ filename: path.join(bootweb.conf.ROOT , '/servers/' , bootweb.conf.SERVER, 'datas', 'users.db'), autoload: true });
  db.find({ uid: 0 }, function (err, docs) {
    if ( docs.length != 0 ) { return }
    else {
      var user = { uid : 0
                   , name : 'admin'
                   , password: password.hash('bootweb')
                 }
       db.insert( user);
      }
  });
});
  }
};
