fs = require('fs');
path = require('path');
log4js = require('log4js')
var extend = require('util')._extend;

// we get all BOOTWEB environement variables starting with BW_
// and we return a javascript config object without BW_ in options names
var env_config = function (bootweb) {
  bootweb.log = log4js.getLogger("bootweb");
  log = log4js.getLogger("bootwebConfig");
  var cnf;
  if (bootweb.conf) {
    cnf = bootweb.conf;
  } else {
    cnf = Object();
  }

  for (v in process.env) {
    var r = /BW_.*/;
    if (v.match(r)) {
      cnf[v.split('_')[1]] = process.env[v];
    }
  }
  cnf['PWD'] = process.env['PWD'];
  try {
    var conf_path = ""
      , log_path = "";
    if (cnf['ROOT'] === undefined && cnf['SERVER'] === undefined) {
      cnf['ROOT'] = cnf['PWD'];
      cnf['server_dir'] = cnf['ROOT'];
      conf_path = path.join(cnf.ROOT, 'bootweb.conf');
      log_path = path.join(cnf.server_dir, 'logs');
      try {
        log4js.configure(path.join(cnf.server_dir, 'log4js.json'), { reloadSecs: 300, cwd: log_path});
      } catch (e) {
        log.warn("Error while reading logs4js conf, skipping");
        log.debug(e);
      }
    } else if (cnf['ROOT'] !== undefined && cnf['SERVER'] !== undefined) {

      cnf['server_dir'] = path.join(cnf.ROOT, 'servers', cnf.SERVER);
      conf_path = path.join(cnf.server_dir, 'etc', 'bootweb.conf');
      log_path = path.join(cnf.server_dir, 'logs');
      log4js.configure(path.join(cnf.server_dir, 'etc', 'log4js.json'), { reloadSecs: 300, cwd: log_path});
    } else {
      log.fatal("No server dir found");
      log.info("ROOT:" + cnf['ROOT'] + ": SERVER:" + cnf['SERVER'] + ": PWD:" + cnf['PWD']);
      throw new Error();
    }
    log.info("Loaded log4js conf");
    log.info("loading conf file : " + conf_path);
    var server_conf = JSON.parse(fs.readFileSync(conf_path));
    extend(cnf, server_conf);
  } catch (e) {
    log.fatal(e);
    log.info(cnf);
    throw e;
  }

  return cnf
}

module.exports = env_config;
