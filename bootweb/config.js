yaml = require ( 'js-yaml' );
fs = require ( 'fs' );
path = require ( 'path' );
var extend = require ( 'util' )._extend

// we get all BOOTWEB environement variables starting with BW_
// and we return a javascript config object without BW_ in options names
var env_config = function () {
  var cnf = new Object ();
  for (v in process.env) {
    r = /BW_.*/
    if ( v.match ( r ) ) {
      cnf[v.split ( '_' )[1]] = process.env[v]
    }
  }
  if ( cnf['ROOT'] === undefined || cnf['SERVER'] === undefined ) {
    cnf['ROOT'] = path.join(__dirname, '..');

    console.log(cnf['ROOT'])
    console.log(process.argv);
    process.exit(1);
  }
  try {
    var server_conf = yaml.safeLoad ( fs.readFileSync ( path.join ( cnf.ROOT, 'servers', cnf.SERVER, 'etc', 'bootweb.conf' ), 'utf8' ) );
    extend ( cnf, server_conf );
    //console.log(doc);
  } catch (e) {
    console.log ( e );
  }
  return cnf
}

module.exports = env_config ()
