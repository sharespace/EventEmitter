describe("The Emitter", function () {

	it("Set the context and returns the instance of the emitter for chaining", function () {
		var emitter = new MQ.Emitter(),
			context = {},
			result;

		expect(function () {
			result = emitter.in(context);
		}).not.toThrowError();

		expect(emitter.context).toBe(context);
		expect(emitter).toBe(result);
	});

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