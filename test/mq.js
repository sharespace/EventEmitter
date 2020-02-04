/*global EventEmitter, describe, it*/
describe("MQ - base", function () {
	"use strict";

	it("create new emitter with context", function () {
		var context = {},
			emitter = EventEmitter.create(context);

		expect(emitter.context).toBe(context);
	});

	it("create new emitter and send event", function () {
		var handler,
			count = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (params) {
			count++;
			expect(params).toEqual({params1: "test"});
		};

		emitter.subscribe("test", handler);

		emitter.event("test", {params1: "test"});
		expect(count).toBe(1);

		emitter.unsubscribe("test", handler);

		emitter.event("test", {params1: "test"});
		expect(count).toBe(1);
	});

	it("create new emitter and send request", function () {
		var handler,
			handler2,
			returned,
			count = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (params) {
			count++;
			expect(params).toEqual({params1: 10});
			return params.params1;
		};
		handler2 = function () {
		};

		emitter.subscribe("test", handler);

		returned = emitter.request("test", {params1: 10});
		expect(count).toBe(1);
		expect(returned).toBe(10);

		emitter.unsubscribe("test", handler);

		expect(function () {
			emitter.request("request", {params1: 10});
		}).toThrow("EventEmitter: Can not make request on event that has not handler for 'request'.");

		expect(count).toBe(1);

		emitter.subscribe("test", handler);
		emitter.subscribe("test", handler2);

		expect(function () {
			emitter.request("test", {params1: 10});
		}).toThrow("EventEmitter: Can not make request on event that has more then one handler. Use EventEmitter.event('test') instead.");

		emitter.unsubscribe("test", handler);
		emitter.unsubscribe("test", handler2);
	});

	it("create new emitter and send demand", function () {
		var handler,
			returned,
			handler2,
			count = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (params) {
			count++;
			expect(params).toEqual({params1: 10});
			return params.params1;
		};
		handler2 = function () {
		};

		emitter.subscribe("test", handler);

		returned = emitter.demand("test", {params1: 10});
		expect(count).toBe(1);
		expect(returned).toBe(10);

		emitter.unsubscribe("test", handler);

		returned = emitter.demand("test", {params1: 10});

		expect(count).toBe(1);
		expect(returned).toBeUndefined();

		emitter.subscribe("test", handler);
		emitter.subscribe("test", handler2);

		expect(function () {
			emitter.demand("test", {params1: 10});
		}).toThrow("EventEmitter: Can not make demand on event that has more then one handler. Use EventEmitter.event('test') instead.");

		emitter.unsubscribe("test", handler);
		emitter.unsubscribe("test", handler2);
	});

	it("create new emitter and send notify", function (done) {
		var start,
			length,
			handler,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function () {
			length = new Date().getTime() - start;
			expect(length).toBeGreaterThan(29);
			emitter.unsubscribe("test", handler);
			done();
		};
		emitter.subscribe("test", handler);

		start = new Date().getTime();

		emitter.notify("test", {start: start});
	});

	it("create new emitter and send event and than destroy all", function () {
		var handler,
			count = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (params) {
			count++;
			expect(params).toEqual({params1: "test"});
		};

		emitter.subscribe("test", handler);

		emitter.event("test", {params1: "test"});
		expect(count).toBe(1);

		emitter.unsubscribe();

		emitter.event("test", {params1: "test"});
		expect(count).toBe(1);
	});

	it("check watching on event", function () {
		var handler,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function () {
		};

		emitter.subscribe("test", handler);

		expect(emitter.watching("test")).toBe(1);
		expect(emitter.watching("test1")).toBe(0);

		emitter.unsubscribe();

		expect(emitter.watching("test")).toBe(0);
		expect(emitter.watching("test1")).toBe(0);
	});

	it("remove events in handler, can not cause error", function () {
		var handler1,
			handler2,
			context = {},
			called1 = true,
			called2 = true,
			emitter = EventEmitter.create(context);

		handler1 = function () {
			emitter.unsubscribe("test", handler1);
			called1 = true;
		};


		handler2 = function () {
			emitter.unsubscribe("test", handler2);
			called2 = true;
		};

		emitter.subscribe("test", handler1);
		emitter.subscribe("test", handler2);

		emitter.event("test");

		expect(called1).toBe(true);
		expect(called2).toBe(true);
	});

	/**
	 * @public
	 * Simulate
	 * @param {Element} element
	 * @param {string} type
	 * @param {Element} target
	 */
	function simulateClick(element, type, target) {
		var fakeEvent = /** @type {Event} */{};

		if (document.createEvent) {
			fakeEvent = document.createEvent("HTMLEvents");
			fakeEvent.initEvent(type, true, true);
		} else {
			fakeEvent = document.createEventObject();
			fakeEvent.eventType = type;
		}

		//fill type
		fakeEvent.eventName = type;

		if (document.createEvent) {
			element.dispatchEvent(fakeEvent);
		} else {
			// noinspection JSAnnotator
			fakeEvent.srcElement = target;
			// noinspection JSAnnotator
			fakeEvent.target = target;
			element.fireEvent("on" + type, fakeEvent);
		}
	}

	it("bind on dom element", function () {
		var dom,
			handler,
			counter = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (event) {
			counter++;
			emitter.interrupt(event[0], true, true);
			expect(event[0].defaultPrevented).toBe(true);
			expect(event[0].returnValue).toBe(false);
		};

		dom = document.createElement("div");
		emitter.subscribe(dom, "click", handler);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(1);

		emitter.unsubscribe(dom, "click", handler);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(1);
	});

	it("bind on dom element twice and fail", function () {
		var dom,
			handler,
			counter = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (event) {
			counter++;
			emitter.interrupt(event[0], true, true);
			expect(event[0].defaultPrevented).toBe(true);
			expect(event[0].returnValue).toBe(false);
		};

		dom = document.createElement("div");

		expect(function () {
			emitter.subscribe(dom, "click", handler);
		}).not.toThrow();
		expect(function () {
			emitter.subscribe(dom, "dblclick", handler);
		}).not.toThrow();

		simulateClick(dom, "click", dom);
		expect(counter).toBe(1);
		simulateClick(dom, "dblclick", dom);
		expect(counter).toBe(2);

		expect(handler.handlers.length).toBe(2);

		expect(function () {
			emitter.subscribe(dom, "click", handler);
		}).not.toThrow();

		expect(function () {
			emitter.subscribe(dom, "dblclick", handler);
		}).not.toThrow();

		expect(handler.handlers.length).toBe(4);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(4);
		simulateClick(dom, "dblclick", dom);
		expect(counter).toBe(6);

		expect(handler.handlers.length).toBe(4);

		emitter.unsubscribe(dom, "click", handler);

		expect(handler.handlers.length).toBe(2);

		emitter.unsubscribe(dom, "dblclick", handler);

		expect(handler.handlers.length).toBe(0);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(6);
		simulateClick(dom, "dblclick", dom);
		expect(counter).toBe(6);
	});

	it("bind on 2 dom elements same handler", function () {
		var dom1,
			dom2,
			handler,
			counter = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (event) {
			counter++;
			emitter.interrupt(event[0], true, true);
			expect(event[0].defaultPrevented).toBe(true);
			expect(event[0].returnValue).toBe(false);
		};

		dom1 = document.createElement("div");
		dom2 = document.createElement("div");

		expect(function () {
			emitter.subscribe(dom1, "click", handler);
		}).not.toThrow();
		expect(function () {
			emitter.subscribe(dom2, "click", handler);
		}).not.toThrow();

		simulateClick(dom1, "click", dom1);
		expect(counter).toBe(1);
		simulateClick(dom2, "click", dom2);
		expect(counter).toBe(2);

		emitter.unsubscribe(dom1, "click", handler);

		simulateClick(dom1, "click", dom1);
		expect(counter).toBe(2);

		simulateClick(dom2, "click", dom2);
		expect(counter).toBe(3);

		emitter.unsubscribe(dom2, "click", handler);

		simulateClick(dom1, "click", dom1);
		expect(counter).toBe(3);
		simulateClick(dom2, "click", dom2);
		expect(counter).toBe(3);

	});

	it("bind triple click", function () {
		var dom,
			handler,
			counter = 0,
			context = {},
			emitter = EventEmitter.create(context);

		handler = function (event) {
			counter++;
			emitter.interrupt(event[0], true, true);
			expect(event[0].defaultPrevented).toBe(true);
			expect(event[0].returnValue).toBe(false);
		};

		dom = document.createElement("div");
		emitter.subscribe(dom, "tripleclick", handler);

		simulateClick(dom, "click", dom);
		simulateClick(dom, "click", dom);
		expect(counter).toBe(0);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(1);

		simulateClick(dom, "click", dom);
		simulateClick(dom, "click", dom);
		expect(counter).toBe(1);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(2);

		emitter.unsubscribe(dom, "tripleclick", handler);

		simulateClick(dom, "click", dom);
		simulateClick(dom, "click", dom);
		simulateClick(dom, "click", dom);
		expect(counter).toBe(2);
	});

	it("bind on dom element 2 times with more contexts", function () {
		var dom,
			handler1,
			handler2,
			counter1 = 0,
			counter2 = 0,
			context1 = {},
			context2 = {},
			emitter1 = EventEmitter.create(context1),
			emitter2 = EventEmitter.create(context2);

		handler1 = function () {
			counter1++;
		};
		handler2 = function () {
			counter2++;
		};

		dom = document.createElement("div");

		emitter1.subscribe(dom, "click", handler1);
		emitter2.subscribe(dom, "click", handler2);

		simulateClick(dom, "click", dom);
		expect(counter1).toBe(1);
		expect(counter2).toBe(1);

		emitter1.unsubscribe(dom, "click", handler1);

		simulateClick(dom, "click", dom);
		expect(counter1).toBe(1);
		expect(counter2).toBe(2);

		emitter2.unsubscribe(dom, "click", handler2);

		simulateClick(dom, "click", dom);
		expect(counter1).toBe(1);
		expect(counter2).toBe(2);
	});

	it("bind on dom element 2 times with more contexts and same handler", function () {
		var dom,
			handler,
			counter = 0,
			context1 = {},
			context2 = {},
			emitter1 = EventEmitter.create(context1),
			emitter2 = EventEmitter.create(context2);

		handler = function () {
			counter++;
		};

		dom = document.createElement("div");

		emitter1.subscribe(dom, "click", handler);
		emitter2.subscribe(dom, "click", handler);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(2);

		emitter1.unsubscribe(dom, "click", handler);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(3);

		emitter2.unsubscribe(dom, "click", handler);

		simulateClick(dom, "click", dom);
		expect(counter).toBe(3);
	});

});