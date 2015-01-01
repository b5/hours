var days = ["Su","Mo","Tu","We","Th","Fr","Sa"]
	, dayNames = { "Su" : 0,"Mo" : 1,"Tu" : 2,"We" : 3,"Th" : 4,"Fr" : 5,"Sa" : 6 }
 	, jsDaysOfWeek = { "Sun" : 0, "Mon" : 1, "Tue" : 2, "Wed" : 3, "Thu" : 4, "Fri" : 5, "Sat" : 6 };

var Hours;

module.exports = Hours = {
	// takes an array of openings & returns true if any of them contain
	// the current time
	openNow : function (hours) {
		var date = new Date();

		for (var i=0, h; h=hours[i]; i++) {
			if (Hours.containsDate(h,date)) {
				return true
			}
		}

		return false;
	},
	validate : function (opening) {
		var r = opening.replace(/[MoTuWehFrSa\s0123456789,:-]*/g,"")
		if (r.length) {
			return false
		}
		return true
	},
	containsDate : function (opening, date) {
		if (!Hours.validate(opening)) { return false; }

		var split = opening.split(" ");
		if (!containsDay(date, split[0])) {
			return false
		}

		if (split.length === 2) {
			if (!containsHour(date, split[1])) {
				return false
			}
		}

		return true
	},
	relativeDate : function (weekday, hours, minutes) {
		var date = new Date()
			, dayNum = jsDaysOfWeek[date.toString().split(' ')[0]]
			, weekdayNum = jsDaysOfWeek[weekday];

		date.setDate(date.getDate() + (weekdayNum - dayNum));
		date.setHours(hours);
		date.setMinutes(minutes);
		date.setSeconds(0);
		date.setMilliseconds(0);

		return date;
	},

	intersects : function (startDate, stopDate, hours) {
		var spans = SpanDays([startDate, stopDate]);

		for (var i=0,span; span=spans[i]; i++) {
			for (var j=0,opening; opening=hours[j]; j++) {
				var split = opening.split(" ")

				// do the days match?
				if (containsDay(span[0], split[0])) {

					// do we have hours in our split?
					// if so, gotta compare 'em.
					if (split.length === 2) {
						var hrSplit = split[1].split('-');

						// hours must be a range
						if (hrSplit.length != 2) {
							continue;
						}

						var end = ParseHour(hrSplit[1])
						var start = ParseHour(hrSplit[0])
						// big 'ol if. If the span start is before the opening end AND
						// the span end is after the opening start, we're interseting
						// basically just cross the start / ends & make sure they're on
						// the correct side of each other
						if ( 
								 (span[0].getHours() < end.hr || (span[0].getHours() == end.hr && span[0].getMinutes() < end.min)) &&
								 (span[0].getHours() > start.hr || (span[1].getHours() == start.hr && span[1].getMinutes() > start.min) )
								)  {
							return true;
						}

					} else if (split.length === 1) {
						// if the length is 1, we're open all day, so it's a match
						return true
					}
				}
			}
		}

		return false;
	}
}; 

function containsDay(date, dayPhase) {
	var day = DayNum(date)
		, days = dayPhase.split(","); // split days on commas


	for (var i=0, d; d=days[i]; i++) {
		// check for ranges
		if (~d.indexOf('-')) {
			var range = d.split('-')
				, start = DayNameNum(range[0])
				, end = DayNameNum(range[1]);

			if (day >= start && day <= end) {
				return true
			}
		} else {
			if (day == DayNum(d)) {
				return true
			}
		}
	}

	return false
}

function containsHour(date, hourPhase) {
	var hour = date.getHours()
		, min = date.getMinutes()
		, split = hourPhase.split('-');

	// hours must be a range
	if (split.length != 2) {
		return false
	}

	var start = ParseHour(split[0])
	if (date.getHours() < start.hr || (start.hr == date.getHours() && date.getMinutes() < start.min) ) {
		return false
	}

	var end = ParseHour(split[1])
	if (date.getHours() > end.hr || (date.getHours() == end.hr && date.getMinutes() > end.min)) {
		return false;
	}

	return true
}

function ParseHour(hourString) {
	var split = hourString.split(":");

	return { hr : !isNaN(+split[0]) ? +split[0] : 0,
					 min : !isNaN(+split[1]) ? +split[1] : 0
					};
}

function DayNum(date) {
	return jsDaysOfWeek[date.toString().split(' ')[0]];
}

function DayNameNum(abr) {
	return dayNames[abr];
}

// Takes a tuple of [start, stop] dates and returns an array of
// tuples cut up according to the days it covers
function SpanDays(span) {

	var spans = []
		, spanStart = span[0]
		, spanStop = span[1]
		, start = span[0]
		, stop;
		// , stop = new Date(start);

	// if we don't cross a date, return a single span.
	if (spanStart.getDate() == spanStop.getDate()) {
		spans.push(span);
		return spans;
	}

	while (true) {

		// set stop to the last second of
		// the start date
		stop = new Date(start);
		stop.setHours(23);
		stop.setMinutes(59);
		stop.setSeconds(59);

		if (stop.valueOf() <= spanStop.valueOf()) {
			spans.push([new Date(start), new Date(stop)]);
			// advance the start date to the first instance
			// of the next date
			start.setDate(start.getDate() + 1)
			start.setHours(0);
			start.setMinutes(0);
			start.setSeconds(0);
			start.setMilliseconds(0);

			// if we advance past the stop date, time to bail
			if (start.valueOf() > spanStop.valueOf()) {
				return spans;
			}

		} else {
			// set the stop to the spanStop date & add it.
			spans.push([new Date(start), new Date(spanStop)]);
			return spans;
		}
	}
}