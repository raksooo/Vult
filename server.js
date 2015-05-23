var express = require('express'),
    finalhandler = require('finalhandler'),
    serveStatic = require('serve-static'),
    alg = require('./src/scripts/algorithm'),
    db = require('./src/scripts/databaseHandler'),
    api = require('./src/scripts/apiCommunicator')
    movies = require('./src/scripts/movies');

var app = express();
app.use(express.static(__dirname + '/src/static'));

db.init();

app.get('/getRecommendedMovies', function(req, res) {
    api.searchMovie(req.query.film, function(original) {
        var data = [];
        var length = movies.movies.length;
        for (var i = 0; i < movies.movies.length ; i++) {
            alg.getResult(original.Title, movies.movies[i], function(result) {
                console.log(data.length);
                if (result == undefined) {
                    length--;
                } else {
                    data.push(result);
                }
                if (data.length == length) {
                    data.sort(sortFunction);
                    res.end(JSON.stringify(data));
                }
            });
        }
    });
});

app.get('/imFeelingLucky', function(req, res) {
    res.end("later...");
});

function sortFunction(a, b) {
    return a.overlap - b.overlap;
}

var server = app.listen(9999, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

