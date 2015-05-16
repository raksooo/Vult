var fs = require('fs');
var db = require('./databaseHandler');

var DATE = '1970-01-01';
var BITS_PER_POSITION = 2; //offsetintervals
var BIT_LENGTH = 1000;

db.openPool();

getResult('twilight', 'kingsman', function(result) {
    console.log(result);
});

function getResult(film1, film2, callback) {
	var subs = getSubtitles(film1, film2);

	db.getResult(film1, film2, function(result, offset, shortFilm) {
		if (result !== undefined) {
			callback({overlap: result, offset: offset, shortFilm: shortFilm});
		} else {
			var sub1 = toBinary(parseSubtitle(subs.film1), BIT_LENGTH);
		    var sub2 = toBinary(parseSubtitle(subs.film2), BIT_LENGTH);
            result = calculateOverlap(sub1, sub2, film1, film2);

            callback(result);
		}
	});
}

function getSubtitles(film1, film2) {
	var kingsman = fs.readFileSync(__dirname + "/example_subtitle/kingsman.srt");
	var twilight = fs.readFileSync(__dirname + "/example_subtitle/twilight.srt");

	return {film1: twilight, film2: kingsman};
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
    var offset = -1;
    for (var i=0; shorter.length+i<=longer.length; i++) {
        var v = calculateLines(compare(longer, shorter, i));
        v /= least;
        if (v < best) {
            best = v;
            offset = i;
        }
    }

    db.insertResult(film1, film2, best, offset, shortFilm);

    return {overlap: best, shorter: shortFilm, offset: offset};
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

function parseSubtitle(subtitle) {
	var lines = subtitle.toString().split('\n');
	var intervals = [];
	var lastEmpty = true;
	var correctLine = false;

	lines.some(function(line) {
		line = line.trim();
		if (correctLine) {
			correctLine = false;
			intervals.push(parseInterval(line));
		} else if (!line.length) {
			lastEmpty = true;
		} else if (lastEmpty && line%1 === 0) {
			correctLine = true;
			lastEmpty = false;
        }
	});

	return intervals;
}

function parseInterval(interval) {
	var array = interval.split(' ');
	interval = {};
	interval.start = parseTime(array[0]);
	interval.end = parseTime(array[2]);

	return interval;
}

function parseTime(time) {
    time = time.replace(',', ':');
	var parsed = (Date.parse(DATE + " " + time) + 60*60*1000);
    return parsed;
}

function toBinary(intervals, bitLength) {
	var current = 1;
	var binary = [current];
	var previousEnd = 0;

	intervals.forEach(function(interval) {
		var noSub = Math.floor(interval.start / bitLength) - Math.ceil(previousEnd / bitLength);
        noSub = noSub < 0 ? 0 : noSub;
		var sub = Math.ceil(interval.end / bitLength) - Math.floor(interval.start / bitLength);
		previousEnd = interval.end;

		binary = binary.concat(addToBinary(binary.pop(), noSub, false));
		binary = binary.concat(addToBinary(binary.pop(), sub, true));
	});

	return binary;
}

function addToBinary(binary, length, value) {
	var binaryLength = Math.ceil(Math.log2(binary + 1));

	if (length + binaryLength <= BITS_PER_POSITION) {
		return [bitShift(binary, length, value)];
	} else {
		var spaceLeft = BITS_PER_POSITION - binaryLength;
		var newBinaries = [bitShift(binary, spaceLeft, value)];
        return newBinaries.concat(addToBinary(1, length-spaceLeft, value));
	}
}

function bitShift(binary, length, value) {
	if (value) {
		for (var i = 0; i < length; i++) {
			binary = (binary << 1) + 1;
		}
	} else {
		binary = binary << length;
	}

	return binary;
}

