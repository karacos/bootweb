var cluster = require ( 'cluster' );
var bootweb = require('../bootweb');
bootweb.onReady(function(bootweb) {
  bootweb.conf.env = 'test';
  if (bootweb.worker) {
    bootweb.log.info("Starting worker process " + bootweb.worker.id);
  } else {
    bootweb.log.info("Starting master process");
  }

  // Code to run if we're in the master process
});
  if ( !cluster.isMaster ) {
    var worker = require ( '../bootweb/worker' );
     worker.init ( cluster, function(err, worker) {
     worker.bootweb.conf.env = 'test';
     if (err) {
        worker.bootweb.log.error("Worker init failed");
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
