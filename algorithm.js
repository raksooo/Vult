var fs = require('fs');

var DATE = '1970-01-01';

fs.readFile(__dirname + "/example_subtitle/Ex.Machina.2015.MULTI.DVDRip.x264.AC3-RARBG.srt", function(err, sub) {
    console.log(parseSubtitle(sub));
});

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
	parsed = Date.parse(DATE + " " + time) + 60*60*1000;
    return parsed;
}
