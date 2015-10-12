describe("The MQ.Timer", function () {

	it("If a timeout is not set, the default value 30 ms will be used", function () {
		var timer = new MQ.Timer();

		expect(timer.timeout).toBe(30);
	});

	it("The timer invokes a callback function after the specified time", function (done) {
		var timer,
			timeout = 500,
			margin = 5,
			start = new Date();

		timer = new MQ.Timer(timeout, function () {
			var delta = new Date() - start;

			expect(timeout === delta || delta < timeout + margin).toBeTruthy();
			done();
		});
		timer.run();
	});
});