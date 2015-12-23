//tests
describe("MQ - base", function () {

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
            expect(params).toEqual({ params1: 'test' });
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
            returned,
            count = 0,
            context = {},
            emitter = EventEmitter.create(context);

        handler = function (params) {
            count++;
            expect(params).toEqual({ params1: 10 });
            return params.params1;
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
    });

    it("create new emitter and send notify", function (done) {
        var start,
            length,
            handler,
            context = {},
            emitter = EventEmitter.create(context);

        handler = function () {
            length = (new Date().getTime()) - start;
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
            expect(params).toEqual({ params1: 'test' });
        };

        emitter.subscribe("test", handler);

        emitter.event("test", {params1: "test"});
        expect(count).toBe(1);

        emitter.unsubscribe();

        emitter.event("test", {params1: "test"});
        expect(count).toBe(1);
    });

    /**
     * @public
     * Simulate
     * @param {Element} element
     * @param {string} type
     * @param {Element} target
     */
    function simulateClick (element, type, target) {
        var fakeEvent = /** @type {Event} */{};

        if (document.createEvent) {
            fakeEvent = document.createEvent("HTMLEvents");
            fakeEvent.initEvent(type, true, true);
        } else {
            fakeEvent = document.createEventObject();
            fakeEvent.eventType = type;
        }

        //fill type
        fakeEvent.srcElement = target;
        fakeEvent.target = target;
        fakeEvent.eventName = type;

        if (document.createEvent) {
            element.dispatchEvent(fakeEvent);
        } else {
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

        dom = document.createElement('div');
        emitter.subscribe(dom, "click", handler);

        simulateClick(dom, "click", dom);
        expect(counter).toBe(1);

        emitter.unsubscribe(dom, "click", handler);

        simulateClick(dom, "click", dom);
        expect(counter).toBe(1);
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

        dom = document.createElement('div');
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

});