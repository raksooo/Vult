var request = require('request'),
    opensubtitles = require('opensubtitles-client').api,
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
    var params = {
        imdbid: movie,
        limit: 5
    };
    console.log("download subtitle for ", movie);
    opensubtitles.login().then(function(logintoken) {
        opensubtitles.search(logintoken, 'eng', params).then(function(results) {
            var found;
            for (var i=0; i<results.length; i++) {
                r = results[i];
                if (r.SubHearingImpaired === "0" && r.SubFormat === "srt") {
                    callback(r.SubDownloadLink);
                    found = true;
                    break;
                }
            }
            if (!found) {
                callback(undefined);
            }
        });
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

