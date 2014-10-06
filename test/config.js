var cluster = require ( 'cluster' );
var Bootweb = require('../bootweb');
/*
bootweb = new Bootweb(cluster);

bootweb.onReady(function(bootweb) {
  bootweb.conf.env = 'test';
  if (bootweb.worker) {
    bootweb.log.info("Starting worker process " + bootweb.worker.id);
  } else {
    bootweb.log.info("Starting master process");
  }

  // Code to run if we're in the master process
});

 */
module.exports = {
	 db: {
	    production: "mongodb://localhost/unittest",
      development: "mongodb://localhost/unittest",
	    test: "mongodb://localhost/unittest",
	  }
};
