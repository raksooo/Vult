var db = require('./databaseHandler'),
    subs = require('./subtitleParser.js');

function getResult(film1, film2, callback) {
    if (film1 === undefined || film2 === undefined) {
        callback(undefined);
    } else {
        db.getResult(film1, film2, function(result, offset, shortFilm) {
            if (result !== undefined) {
                callback({overlap: result, offset: offset*subs.BITS_PER_POSITION, shortFilm: shortFilm, film: film2});
            } else {
                subs.getSubtitleBinary(film1, function(sub1) {
                    subs.getSubtitleBinary(film2, function(sub2) {
                        if (sub1 === undefined || sub2 === undefined) {
                            callback(undefined);
                        } else {
                            result = calculateOverlap(sub1, sub2, film1, film2);
                            callback(result);
                        }
                    });
                });
            }
        });
    }
}

function compare(longer, shorter, offset) {
    var result = [];
    for (var i=0; i<offset; i++) {
        result[i] = 0;
    }
    for (var i=0; i<longer.length; i++) {
        result[i+offset] = longer[i+offset] & shorter[i];
    }

    return result;
}

function calculateOverlap(sub1, sub2, film1, film2) {
    var longer, shorter;
    var shortFilm;
    if (sub1.length > sub2.length) {
        longer = sub1;
        shorter = sub2;
        shortFilm = film2;
    } else {
        longer = sub2;
        shorter = sub1;
        shortFilm = film1;
    }

    var least = Math.min(calculateLines(shorter), calculateLines(longer));
    var best = 1;
    var offset = 0;
    for (var i=0; shorter.length+i<=longer.length; i++) {
        var v = calculateLines(compare(longer, shorter, i));
        v /= least;
        if (v < best) {
            best = v;
            offset = i;
        }
    }

    db.insertResult(film1, film2, best, offset, shortFilm);
    return {overlap: best, shortFilm: shortFilm, offset: offset*subs.BITS_PER_POSITION, film: film2};
}

function calculateLines(lines) {
    var line = 0;

    lines.forEach(function(interval) {
        if (interval !== 0) {
            line -= 1;
        }
        while (interval >= 1) {
            if (interval % 2 !== 0) {
                line++;
            }
            interval = interval >> 1;
        }
    });

    return line;
}

exports.getResult = getResult;

