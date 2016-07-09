/*global console, MQ, describe, it, spyOn*/
describe("The Emitter", function () {
	"use strict";

	/**
	 * Creates a non-static emitter.
	 * @return {MQ.Emitter}
	 */
	function createEmitter() {
		return new MQ.Emitter();
	}

	/**
	 * Returns a static emitter.
	 * @return {MQ.Emitter}
	 */
	function createStaticEmitter() {
		return new MQ.Emitter(true);
	}

	/**
	 * Creates a fake event.
	 * @return {object}
	 */
	function createFakeEvent() {
		return {
			cancelBubble: false,
			preventDefault: function () {},
			stopPropagation: function () {}
		};
	}

	it("Creates a new emitter with the context", function () {
		var staticEmitter = createStaticEmitter(),
			context = {},
			emitter;

		emitter = staticEmitter.create(context);

		expect(emitter.constructor).toBe(MQ.Emitter);
		expect(emitter).not.toBe(staticEmitter);
		expect(emitter.context).toBe(context);
	});

	it("The method 'event' returns the emitter for chaining", function () {
		var emitter = createEmitter(),
			result;

		result = emitter.event("test", null);
		expect(result).toBe(emitter);
	});

	it("Stop the event propagation on the event interrupt", function () {
		var emitter = createEmitter(),
			event = createFakeEvent();

		spyOn(event, "stopPropagation");
		emitter.interrupt(event, true, true);

		expect(event.stopPropagation).toHaveBeenCalled();
		expect(event.cancelBubble).toBeTruthy();
	});

	it("Do not stop the event propagation on the event interrupt", function () {
		var emitter = createEmitter(),
			event = createFakeEvent();

		spyOn(event, "stopPropagation");
		emitter.interrupt(event, false, true);

		expect(event.stopPropagation).not.toHaveBeenCalled();
		expect(event.cancelBubble).toBeFalsy();
	});

	it("Prevent default on the event interrupt", function () {
		var emitter = createEmitter(),
			event = createFakeEvent();

		spyOn(event, "preventDefault");
		emitter.interrupt(event, true, true);

		expect(event.preventDefault).toHaveBeenCalled();
		expect(event.returnValue).toBe(false);
	});

	it("Do not prevent default on the event interrupt", function () {
		var emitter = createEmitter(),
			event = createFakeEvent();

		spyOn(event, "preventDefault");
		emitter.interrupt(event, true, false);

		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it("Set the context and returns the instance of the emitter for chaining", function () {
		var emitter = createEmitter(),
			context = {},
			result = null;

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
		var emitter = createEmitter();

		spyOn(console, "info");
		emitter.debugMode(true, []);
		expect(console.info).toHaveBeenCalledWith("EventEmitter debug mode is set to on");
	});

	it("Disable debug mode", function () {
		var emitter = createEmitter();

		spyOn(console, "info");
		emitter.debugMode(false, []);
		expect(console.info).toHaveBeenCalledWith("EventEmitter debug mode is set to off");
	});

	it("An emitter provides version", function () {
		var emitter = createEmitter();

		expect(emitter.version).toBeDefined();
	});
});