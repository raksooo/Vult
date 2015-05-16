var express = require('express');
var mysql = require('mysql');
var alg = require('./algorithm');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/getRecommendedMovies', function(req, res) {
  alg.getResult(req.query.film, 'twilight', function(result) {
    res.send(result);
  });
});

var server = app.listen(9999, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

var scripts = require('./scripts/app.js');
scripts.init();

