var fs = require('fs');
var scripts = require('./scripts/app.js');

var DATE = '1970-01-01';
var BITS_PER_POSITION = exports.BITS_PER_POSITION = 6; //offsetintervals
var BIT_LENGTH = exports.BIT_LENGTH = 1000;

exports.getSubtitles = function(film, callback) {
    /*fs.readFile(__dirname + '/example_subtitle/chappie.srt', function(err, data) {
        callback(data);
    });*/
    scripts.init(film, callback);
},

exports.parseSubtitle = function(film, callback) {
    exports.getSubtitles(film, function(subtitle) {

    var lines = subtitle.toString().split('\n');
    var intervals = [];
    var lastEmpty = true;
    var correctLine = false;

    lines.some(function(line) {
        line = line.trim();
        if (correctLine) {
            correctLine = false;
            intervals.push(exports.parseInterval(line));
        } else if (!line.length) {
            lastEmpty = true;
        } else if (lastEmpty && line%1 === 0) {
            correctLine = true;
            lastEmpty = false;
        }
    });

  callback(intervals);
  });
},

exports.parseInterval = function(interval) {
    var array = interval.split(' ');
    interval = {};
    interval.start = exports.parseTime(array[0]);
    interval.end = exports.parseTime(array[2]);

    return interval;
},

exports.parseTime = function(time) {
    time = time.replace(',', ':');
    var parsed = (Date.parse(DATE + " " + time) + 60*60*1000);
    return parsed;
},

exports.toBinary = function(intervals, bitLength) {
    var current = 1;
    var binary = [current];
    var previousEnd = 0;

    intervals.forEach(function(interval) {
        var noSub = Math.floor(interval.start / bitLength) - Math.ceil(previousEnd / bitLength);
        noSub = noSub < 0 ? 0 : noSub;
        var sub = Math.ceil(interval.end / bitLength) - Math.floor(interval.start / bitLength);
        previousEnd = interval.end;

        binary = binary.concat(exports.addToBinary(binary.pop(), noSub, false));
        binary = binary.concat(exports.addToBinary(binary.pop(), sub, true));
    });

    return binary;
},

exports.addToBinary = function(binary, length, value) {
    var binaryLength = Math.ceil(Math.log2(binary + 1));

    if (length + binaryLength <= BITS_PER_POSITION) {
        return [exports.bitShift(binary, length, value)];
    } else {
        var spaceLeft = BITS_PER_POSITION - binaryLength;
        var newBinaries = [exports.bitShift(binary, spaceLeft, value)];
        return newBinaries.concat(exports.addToBinary(1, length-spaceLeft, value));
    }
},

exports.bitShift = function(binary, length, value) {
    if (value) {
        for (var i = 0; i < length; i++) {
            binary = (binary << 1) + 1;
        }
    } else {
        binary = binary << length;
    }

    return binary;
}

