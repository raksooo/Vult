var db = require('./databaseHandler');
var subs = require('./subtitles.js');

db.openPool();

exports.getResult = function(film1, film2, callback) {
	db.getResult(film1, film2, function(result, offset, shortFilm) {
		if (result !== undefined) {
			callback({overlap: result, offset: offset*subs.BITS_PER_POSITION, shortFilm: shortFilm, film: film2});
		} else {
            subs.parseSubtitle(film1, function(parsed1) {
                subs.parseSubtitle(film2, function(parsed2) {
                    var sub1 = subs.toBinary(parsed1, subs.BIT_LENGTH);
                    var sub2 = subs.toBinary(parsed2, subs.BIT_LENGTH);
                    result = calculateOverlap(sub1, sub2, film1, film2);

                    callback(result);
                });
            });
        }
	});
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
    return {overlap: best, shorter: shortFilm, offset: offset*subs.BITS_PER_POSITION, film: film2};
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

