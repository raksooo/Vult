var request = require('request'),
    exec = require('child_process').exec,
    zlib = require('zlib');

function searchMovie(query, callback) {
    var url = 'http://www.omdbapi.com/?t=' + encodeURIComponent(query);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            callback(body);
        }
    });
}

function getSubtitle(movie, callback) {
    findSubtitle(movie, function(url) {
        if (url === undefined) {
            callback(undefined);
        } else {
            downloadSubtitle(url, function(sub) {
                callback(sub);
            });
        }
    });
}

function findSubtitle(movie, callback) {
    exec('subtitler "' + movie + '" -lang eng -n 1', function (error, stdout, stderr) {
        var result = stdout.toString().split('\n');
        if (result.length < 9) {
            callback(undefined);
        } else {
            var out = result[8];
            out = out.substring(out.indexOf('http'));
            callback(out.trim());
        }
    });
}

function downloadSubtitle(url, callback) {
    var sub = "";
    request(url).pipe(zlib.createGunzip()).on('data', function(data) {
        sub += data.toString();
    }).on('end', function() {
        if (sub.trim().substring(0, 1) !== '1') {
            callback(undefined);
        } else {
            callback(sub);
        }
    }).on('error', function() {
        console.log('Slut för idag :(');
    });
}

module.exports = {
    searchMovie: searchMovie,
    getSubtitle: getSubtitle
};

