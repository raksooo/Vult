var fs = require('fs'),
    db = require('./databaseHandler'),
    scripts = require('./app.js');

var DATE = '1970-01-01';
var BITS_PER_POSITION = exports.BITS_PER_POSITION = 6; //offsetintervals
var BIT_LENGTH = 1000;

function getSubtitle(film, callback) {
    fs.readFile(__dirname + '/../../example_subtitle/chappie.srt', function(err, data) {
        callback(data);
    });
    //scripts.init(film, callback);
}

function getSubtitleBinary(film, callback) {
    db.getSub(film, function(binary) {
        if (binary !== undefined) {
            callback(binary);
        } else {
            getSubtitle(film, function(subtitle) {
                var parsed = parseSubtitle(subtitle);
                var binary = toBinary(parsed, BIT_LENGTH);
                db.insertSub(film, binary);

                callback(binary);
            });
        }
    });
}

function parseSubtitle(subtitle) {
    var lines = subtitle.toString().split('\n');
    var intervals = [];
    var lastEmpty = true;
    var correctLine = false;

    lines.forEach(function(line) {
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
    var binary = [1];
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

exports.getSubtitleBinary = getSubtitleBinary;

