var fs = require('fs')
  , path = require('path')
  , bootweb = require('../../bootweb')
  , conf = bootweb.conf
  , express = require("express")
  , app = express()
  , morgan = require('morgan')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , NedbStore = require('connect-nedb-session')(session)
  , cookieParser = require('cookie-parser')
  , flash = require('connect-flash')
  , passport = require('passport');

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));

app.get('/', function (req, res) {
  res.render('index', {
    title: "The bootweb application server",
    instance: "worker " + app.bootweb.worker.id
  })
});


module.exports = app;
