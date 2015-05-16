var DATE = '1970-01-01';

function parseSubtitle(subtitle) {
	var lines = subtitle.split('\n');
	var intervals = [];
	var n = 1;
	var lastEmpty = false;
	var correctLine = false;

	lines.forEach((line) => {
		line = trim(line);
		if (correctLine) {
			correctLine = false;
			intervals.push(parseInterval(line));
		} else if (lastEmpty) {
			correctLine = true;
			lastEmpty = false;
		} else if (!line.length) {
			lastEmpty = true;
		}	
	});

	return intervals;
}

function parseInterval(interval) {
	var array = interval.split(' ');
	interval = {};
	interval.start = Date.parse(DATE + array[0]) + 60*60*1000;
	interval.end = Date.parse(DATE + array[2]) + 60*60*1000;
	
	return interval;
}