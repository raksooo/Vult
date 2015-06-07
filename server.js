var express = require('express'),
    app = express(),
    finalhandler = require('finalhandler'),
    serveStatic = require('serve-static'),
    async = require('async'),
    expressWs = require('express-ws')(app),
    alg = require('./src/scripts/algorithm'),
    db = require('./src/scripts/databaseHandler'),
    api = require('./src/scripts/apiCommunicator'),
    subs = require('./src/scripts/subtitleParser'),
    movies = require('./src/scripts/movies');

app.use(express.static(__dirname + '/src/static'));

db.init();

app.ws('/', function(ws, req) {
    ws.on('message', function(message) {
        message = JSON.parse(message);
        if (message.type === 'recommended') {
            getRecommendedMovies(message.movie, function(result) {
                ws.send(result);
            });
        }
    });
});

function getRecommendedMovies(movie, callback) {
    prepareFirstMovie(movie, function(original) {
        if (!original) {
            callback("[]");
        } else {
            var q = async.queue(compare, 3);
            q.drain = function() {
                callback("done");
            };

            for (var i = 0; i < movies.movies.length ; i++) {
                q.push({original: original, other: movies.movies[i]}, function(result) {
                    if (result) {
                        callback(JSON.stringify(result));
                    }
                });
            }
        }
    });
}

app.get('/imFeelingLucky', function(req, res) {
    res.end("later...");
});

function prepareFirstMovie(movie, callback) {
    api.searchMovie(movie, function(original) {
        if (original.imdbID) {
            var id = original.imdbID.substring(2);
            subs.getSubtitleBinary(id, function(sub) {
                callback(original);
            });
        } else {
            callback(undefined);
        }
    });
}

function compare(params, callback) {
    var originalId = params.original.imdbID.substring(2);
    api.searchMovie(params.other, function(other) {
        if (other.imdbID) {
            var otherId = other.imdbID.substring(2);
            alg.getResult(originalId, otherId, function(result) {
                callback(result);
            });
        } else {
            callback(undefined);
        }
    });
}

var server = app.listen(9999, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

