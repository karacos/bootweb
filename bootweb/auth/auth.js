// config/auth.js
var authconf = {}
  , path = require('path')
  , fs = require('fs');



// expose our config directly to our application using module.exports
module.exports = {
  conf: authconf,
  init: function(bootweb) {
    bootweb.onReady(function(){
  requireName = path.join(bootweb.conf.ROOT , '/servers/' , bootweb.conf.SERVER , 'etc') + "auth";
  if (fs.existsSync(requireName + ".js")) {
    authconf = require(requireName);
    module.exports = authconf;
  }
});
  }
}; /*{

	'facebookAuth' : {
		'clientID' 		: 'your-secret-clientID-here',// your App ID
		'clientSecret' 	: 'your-client-secret-here',// your App Secret
		'callbackURL' 	: 'htt../localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: 'htt../localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'htt../localhost:8080/auth/google/callback'
	}

};*/
