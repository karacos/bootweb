var express = require('express')
  , bootweb = require('../../bootweb')
  , WebSocketServer = require('ws').Server
  , app = express();

app.set('name', 'serverstats');

app.use(function (req, res, next) {
  if (typeof bootweb.wss[app.get('name')] == "undefined") {
    bootweb.wss[app.get('name')] = new WebSocketServer({server: bootweb.server});
    bootweb.wss[app.get('name')].on('connection', function(ws) {
      var id = setInterval(function() {
        ws.send(JSON.stringify(process.memoryUsage()), function() {  });
        }, 100);
      console.log('started client interval');
      ws.on('close', function() {
        console.log('stopping client interval');
        clearInterval(id);
        });
      })
    }
  next();
  });

app.use(express.static(__dirname + '/public'));

module.exports = app;
