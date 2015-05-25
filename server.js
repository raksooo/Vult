var express = require('express'),
    finalhandler = require('finalhandler'),
    serveStatic = require('serve-static'),
    alg = require('./src/scripts/algorithm'),
    db = require('./src/scripts/databaseHandler'),
    api = require('./src/scripts/apiCommunicator'),
    subs = require('./src/scripts/subtitleParser'),
    movies = require('./src/scripts/movies');

var app = express();
app.use(express.static(__dirname + '/src/static'));

db.init();

app.get('/getRecommendedMovies', function(req, res) {
    prepareFirstMovie(req.query.film, function(original) {
        if (!original) {
            res.end("{}");
        } else {
            var data = [];
            var length = movies.movies.length;
            for (var i = 0; i < movies.movies.length ; i++) {
                var id = original.imdbID.substring(2);
                alg.getResult(id, movies.movies[i], function(result) {
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
        }
    });
});

app.get('/imFeelingLucky', function(req, res) {
    res.end("later...");
});

function prepareFirstMovie(movie, callback) {
    api.searchMovie(movie, function(original) {
        subs.getSubtitleBinary(original.Title, function(sub) {
            callback(original);
        });
    });
}

function sortFunction(a, b) {
    return a.overlap - b.overlap;
}

var server = app.listen(9999, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

