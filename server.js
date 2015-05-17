var express = require('express'),
    finalhandler = require('finalhandler'),
    serveStatic = require('serve-static'),
    mysql = require('mysql'),
    alg = require('./src/scripts/algorithm'),
    db = require('./src/scripts/databaseHandler'),
    movies = require('./src/scripts/movies'),
    scripts = require('./src/scripts/app.js');

var app = express();
app.use("/static", express.static(__dirname + '/src/static'));
var serve = serveStatic("./src/static/");

db.init();

app.get('/', function (req, res) {
    var done = finalhandler(req, res);
    serve(req, res, done);
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


