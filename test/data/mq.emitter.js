describe("The Emitter", function () {


	it("The method 'in' throws an exception for the static emitter", function () {
		var emitter = new MQ.Emitter(true);

		expect(function () {
			emitter.in(null);
		}).toThrow("EventEmitter: Can not change context on static method. Use EventEmitter.create() with right context.");
	});

	it("Enable debug mode", function () {
		var emitter = new MQ.Emitter();

		spyOn(console, "info");
		emitter.debugMode(true, []);
		expect(console.info).toHaveBeenCalledWith("EventEmitter debug mode is set to on");
	});

	it ("Disable debug mode", function () {
		var emitter = new MQ.Emitter();

		spyOn(console, "info");
		emitter.debugMode(false, []);
		expect(console.info).toHaveBeenCalledWith("EventEmitter debug mode is set to off");
	});

	it("An emitter provides version", function () {
		var emitter = new MQ.Emitter();

		expect(emitter.version).toBeDefined();
	});
});