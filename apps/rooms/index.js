var app = require('express')()
, server = require('http').createServer(app)
, io = require('socket.io')(server).of('/rooms');

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

module.exports = app;
