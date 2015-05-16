var express = require('express');
var mysql = require('mysql');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(8888, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

var scripts = require('./scripts/app.js');
scripts.init();

