/**
 * Created by nico on 12/09/14.
 */
//!../../bin/node-v0.10.26-linux-x64/bin/node

// Include the cluster module
var cluster = require ( 'cluster')
  , Bootweb = require("./")
  , bootweb = new Bootweb(cluster);
// Code to run if we're in the master process
if ( bootweb.cluster.isMaster ) {
  var master = require ( './master' );
  master.init ( bootweb, function(err, bootweb) {
    if (err) {
      bootweb.log.error("Master init failed");
    } else {
      master.run ();
    }
  } );

// Code to run if we're in a worker process
} else {
  var worker = require ( './worker' );
  worker.init ( bootweb, function(err, bootweb) {
    if (err) {
      bootweb.log.error("Worker init failed");
    } else {
      worker.run ();
    }
  } );
}
