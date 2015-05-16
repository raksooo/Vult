var express = require('express');
var mysql = require('mysql');
var alg = require('./algorithm');
var movies = require('./movies');
var app = express();

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/styles.css', function (req, res) {
  res.sendfile(__dirname + '/styles.css');
});

app.get('/getRecommendedMovies', function(req, res) {
  alg.getResult('furious', 'chappie', function(result) {
    res.send(result);
  });
});

var server = app.listen(9999, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

var movieName = 'Pocahontas';
var scripts = require('./scripts/app.js');
scripts.init(movieName);
movieName = 'Big Fish';
scripts.init(movieName);

