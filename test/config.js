var cluster = require ( 'cluster' )
var bootweb = require('../bootweb');
bootweb.onReady(function(bootweb) {
  bootweb.conf.env = 'test';
});
// Code to run if we're in the master process
if ( !cluster.isMaster ) {
  var worker = require ( '../bootweb/worker' );
  worker.init ( cluster, function(err, bootweb) {
    if (err) {
      bootweb.log.error("Worker init failed");
    } else {
      worker.run ();
    }
  } );
}
module.exports = {
	 db: {
	    production: "mongodb://localhost/unittest",
      development: "mongodb://localhost/unittest",
	    test: "mongodb://localhost/unittest",
	  }
};
