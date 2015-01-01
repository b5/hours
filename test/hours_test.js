var assert = require('assert')
	, Hours = require('../index');

var daysObject = { "Sun" : 0, "Mon" : 1, "Tue" : 2, "Wed" : 3, "Thu" : 4, "Fri" : 5, "Sat" : 6 }
	, daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];



describe("Hours", function () {
	it("validate", function () {
		var cases = {
			"Mo-Fr 9:00-17:00": true,
			"Tu-Th":            true,
			"Mo,Tu-Th 0:00-22:00" : true,
			"qwertyuiop[":      false,
		}

		for (var testCase in cases) {
			var outcome = cases[testCase];
			assert.equal(outcome, Hours.validate(testCase), testCase + " : " + outcome + " != " + Hours.validate(testCase));
		}

	});

	it("relativeDate", function () {
		var cases = {

		}

	});

	it("contains", function () {
		var cases = {
			"Su-Sa" : { date : new Date(), contains : true },
			"Su-Th 9:00-17:00" : { date : Hours.relativeDate("Wed",15,30), contains : true },
			"We 9:00-16:00" : { date : Hours.relativeDate("Wed",16,30), contains : false },
		}

		for (var testCase in cases) {
			var outcome = cases[testCase];
			assert.equal(outcome.contains, Hours.containsDate(testCase, outcome.date), testCase + " expected: " +  outcome.contains + " received: " + Hours.containsDate(testCase, outcome.date));
		}
	});

	it('openNow', function(){
		var cases = [
			{ hours : ["Su-Sa"], outcome : true },
		];

		for (var i=0, testCase; testCase= cases[i]; i++) {
			var outcome = testCase.outcome
				, hours = testCase.hours;
			assert.equal(outcome, Hours.openNow(hours), testCase + " : " + outcome + " != " + Hours.openNow(hours));
		}
	});

	it('intersects', function () {
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		var cases = [
			{ start : new Date(), stop : tomorrow, hours : ["Su-Sa"], outcome : true },
			{ start : Hours.relativeDate("Mon", 0, 0), stop : Hours.relativeDate("Mon", 18,00), hours : ["Tu-Th"], outcome : false }
		];

		for (var i=0, testCase; testCase= cases[i]; i++) {
			var outcome = testCase.outcome
				, start = testCase.start
				, stop = testCase.stop
				, hours = testCase.hours;

			assert.equal(outcome, Hours.intersects(start, stop, hours), "intersets test case " + i + " : " + outcome + " != " + Hours.intersects(start, stop, hours));
		}
	});
});