var Db 	= require('tingodb').Db
    , path 	= require('path')
    , assert 	= require('assert');

var db = new Db(path.join(process.env.BW_ROOT, 'server', process.env.BW_SERVER, 'datas', 'bootweb', {}));

module.exports = db;
