var express = require('express');
var mysql = require('mysql');
var alg = require('./algorithm');
var movies = require('./movies');
var app = express();
var scripts = require('./scripts/app.js');

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/styles.css', function (req, res) {
  res.sendfile(__dirname + '/styles.css');
});

app.get('/getRecommendedMovies', function(req, res) {
  var data = [];
  var length = movies.movies.length;
  for (var i = 0; i < movies.movies.length ; i++) {
    movieName = movies.movies[i];
    alg.getResult(req.query.film, movieName, function(result) {
      if (result == undefined) {
        length--;
      } else {
          data[data.length] = result;
      }
      if (data.length == length) {
        res.end(JSON.stringify(data));
      }
    });
  }
});

var server = app.listen(9999, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});


