var cluster = require('cluster')
  , config = require('./config');

module.exports = function( msg ) {

  if ( msg.cmd ) { 
    switch(msg.cmd)
    {
    case 'getConfig':
         process.send( { cmd : 'setConfig', from : 'Master', data : config } );
         break;
    case 'setConfig':
         console.log( cmd.data );
         return cmd.data;
         break;
    default:
         break;
    }
  }
};