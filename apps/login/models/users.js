var Datastore = require('nedb')
  , password = require('../lib/password')
  , path = require('path')
  , db = new Datastore({ filename: path.join(process.env.BW_ROOT, 'server', process.env.BW_SERVER, 'datas', 'users.db'), autoload: true });

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

module.exports = db;
