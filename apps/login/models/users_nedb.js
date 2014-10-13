var Datastore = require('nedb')
  , password = require('../password')
  , path = require('path')
  , db = new Datastore({ filename: path.join(process.env.BW_ROOT, 'servers', process.env.BW_SERVER, 'datas', 'users.db'), autoload: true });

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
