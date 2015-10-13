MQ.Emitter = (function (MQ) {
	/** @type {Object}*/
	var Emitter,
		debugFilters = [],
		debugMode = false,
		store = new MQ.Store();

	//set data
	/**
	 * @type {Window}
	 * @protected
	 */
	MQ._default = window;

	/**
	 * Add event
	 * @param {Window|HTMLElement|HTMLDocument} element
	 * @param {string} eventType
	 * @param {function} handler
	 */
	function addEvent (element, eventType, handler) {
		/**
		 * Done
		 * @param {Event} e
		 */
		handler.eventDoneRuntime = function (e) {
			handler(window.event || e);
		};

		// DOM Level 2 browsers
		if (element.addEventListener) {
			//noinspection JSUnresolvedVariable
			element.addEventListener(eventType, handler.eventDoneRuntime, false);
			// IE <= 8
		} else {
			element = element === window ? document : element;
			//noinspection JSUnresolvedVariable
			element.attachEvent('on' + eventType, handler.eventDoneRuntime);
		}
		//for firefox
		if (eventType === "mousewheel") {
			//noinspection JSUnresolvedVariable
			addEvent(element, "DOMMouseScroll", handler.eventDoneRuntime);
		}
	}

	/**
	 * Remove handler
	 * @param {Window|HTMLElement} element
	 * @param {string} eventType
	 * @param {function} handler
	 */
	function removeEvent (element, eventType, handler) {
		// For all major browsers, except IE 8 and earlier
		if (element.removeEventListener) {
			//noinspection JSUnresolvedVariable
			element.removeEventListener(eventType, handler.eventDoneRuntime);
			// For IE 8 and earlier versions
		} else {
			element = element === window ? document : element;
			//noinspection JSUnresolvedVariable
			element.detachEvent('on' + eventType, handler.eventDoneRuntime);
		}
		//for firefox
		if (eventType === "mousewheel") {
			//noinspection JSUnresolvedVariable
			removeEvent(element, "DOMMouseScroll", handler.eventDoneRuntime);
		}
	}

	/**
	 * Stop propagation
	 * @param {Event} e
	 * @returns {boolean}
	 */
	function stopPropagation (e) {
		e.cancelBubble = true;
		if (e.stopPropagation !== undefined) {
			e.stopPropagation();
		}
	}

	/**
	 * Cancel default
	 * @param {Event} e
	 * @returns {boolean}
	 */
	function cancelDefault (e) {
		var evt = e ? e:window.event;
		if (evt.preventDefault) evt.preventDefault();
		evt.returnValue = false;
		return false;
	}

	/**
	 * Normalize params
	 * @param {Document|Window|Element|string} nameOrElement
	 * @param {string|function} nameOrHandler
	 * @param {function} handler
	 * @param {Array.<Object>=} paramsOrUndefined
	 * @returns {{element: Element, name: string, handler: function, params: Array.<Object>}}
	 */
	function normalizeSubscribeParams (nameOrElement, nameOrHandler, handler, paramsOrUndefined) {

		//type 1
		if (typeof nameOrElement === "string" && typeof nameOrHandler === "function") {
			//return
			return {
				element: null,
				name: nameOrElement,
				handler: nameOrHandler,
				params: paramsOrUndefined || []
			}
		}

		//type 2
		var isElement = nameOrElement.nodeType && nameOrElement.nodeType == 1,
			isDocument = nameOrElement === document,
			isWindow = nameOrElement === window;
		//check
		if ((isElement || isWindow || isDocument) && typeof nameOrHandler === "string" && typeof handler === "function") {
			//return
			return {
				element: nameOrElement,
				name: nameOrHandler,
				handler: handler,
				params: paramsOrUndefined || []
			}
		}

		//error
		throw "EventEmitter: Incorrect parameters given into function subscribe() or unsubscribe().";
	}

	/**
	 * Normalize params
	 * @param {Document|Window|Element|string} nameOrElement
	 * @param {string|function} nameOrHandler
	 * @param {function} handler
	 * @returns {{element: Element, name: string, handler: function}}
	 */
	function normalizeUnsubscribeParams (nameOrElement, nameOrHandler, handler) {
		//type 1
		if (nameOrElement === undefined || nameOrHandler === undefined) {
			//return
			return {
				element: null,
				name: null,
				handler: null
			}
		}

		//type 2
		if (typeof nameOrElement === "string" && typeof nameOrHandler === "function") {
			//return
			return {
				element: null,
				name: nameOrElement,
				handler: nameOrHandler
			}
		}

		//type 3
		var isElement = nameOrElement.nodeType && nameOrElement.nodeType == 1,
			isDocument = nameOrElement === document,
			isWindow = nameOrElement === window;
		//check
		if ((isElement || isWindow || isDocument) && typeof nameOrHandler === "string" && typeof handler === "function") {
			//return
			return {
				element: nameOrElement,
				name: nameOrHandler,
				handler: handler
			}
		}

	}

	/**
	 * Debug mode reporter
	 * @param {string} type
	 * @param {string} eventName
	 * @param {string} message
	 * @param {object} data
	 */
	function debugReporter(type, eventName, message, data) {
		//do not debug if not right mode
		if (!console || !debugMode) {
			return;
		}
		//ignore all events in filter
		if (debugFilters.indexOf(eventName) >= 0) {
			return;
		}
		//get display fnc
		if (console[type]) {
			console[type]("EventEmitter: (" + (new Date()).toLocaleTimeString() + ") " + message, data);
		} else {
			console.info("EventEmitter: (" + (new Date()).toLocaleTimeString() + ") " + message, data);
		}
	}

	//PUBLIC INTERFACE

	/**
	 * Emitter
	 * @param {boolean} isStatic
	 * @constructor
	 */
	Emitter = function (isStatic) {
		/** @type {Object}*/
		this.context = MQ._default;
		/** @type {boolean}*/
		this.isStatic = isStatic || false;
	};

	/**
	 * Create new
	 * @param {Object} context
	 * @returns {Emitter}
	 */
	Emitter.prototype.create = function (context) {
		return new MQ.Emitter().in(context);
	};

	/**
	 * Event
	 * @param {string} name
	 * @param {Object} params
	 * @returns {Emitter}
	 */
	Emitter.prototype.event = function (name, params) {
		debugReporter("debug", name, "Event for '" + name + "' send with parameters ", params);
		//evaluate
		store.evaluate(name, params);
		//return self
		return this;
	};

	/**
	 * Notify
	 * @param {string} name
	 * @param {Object} params
	 * @returns {MQ.Timer}
	 */
	Emitter.prototype.notify = function (name, params) {
		debugReporter("debug", name, "Notify for '" + name + "' send with parameters ", params);
		//timer
		var timer = new MQ.Timer(30, function () {
			store.evaluate(name, params);
		});
		//run
		timer.run();
		//return timer
		return timer;
	};

	/**
	 * Request
	 * @param {string} name
	 * @param {Object} params
	 * @return {Object}
	 */
	Emitter.prototype.request = function (name, params) {
		//evaluate and return response
		var returnValue = store.request(name, params);
		//reporter
		debugReporter("debug", name, "Request for '" + name + "' return '" + returnValue + "' for parameters ", params);
		//return data
		return returnValue;
	};

	/**
	 * Subscribe
	 * @param {Element|string} nameOrElement
	 * @param {string|function} nameOrHandler
	 * @param {function=} handlerOrUndefined
	 * @param {Array.<Object>=} paramsOrUndefined
	 * @returns {Emitter}
	 */
	Emitter.prototype.subscribe = function (nameOrElement, nameOrHandler, handlerOrUndefined, paramsOrUndefined) {
		var name,
			element,
			handler,
			context = this.context,
			data = normalizeSubscribeParams(nameOrElement, nameOrHandler, handlerOrUndefined, paramsOrUndefined);

		//data get
		element = data.element;
		name = data.name;
		handler = data.handler;

		//for element
		if (element) {
			//add event
			handler.eventHandlerRuntime = function (event) {
				handler.apply(context, [[event].concat(data.params)]);
			};
			addEvent(element, name, handler.eventHandlerRuntime);
		//no element event
		} else {
			//save to storage
			store.save(this.context, name, handler);
		}
		//return self
		return this;
	};

	/**
	 * Unsubscribe
	 * @param {Element|string} nameOrElement
	 * @param {string|function} nameOrHandler
	 * @param {function=} handlerOrUndefined
	 * @returns {Emitter}
	 */
	Emitter.prototype.unsubscribe = function (nameOrElement, nameOrHandler, handlerOrUndefined) {
		var name,
			element,
			handler,
			data = normalizeUnsubscribeParams(nameOrElement, nameOrHandler, handlerOrUndefined);

		//data get
		element = data.element;
		name = data.name;
		handler = data.handler;

		//this is weird
		if (this.context === MQ._default && !name && !handler) {
			console.warn('EventEmitter: You are calling unsubscribe method without parameters. This is unbind all event through application!');
		}

		if (element) {
			//remove event
			removeEvent(element, name, handler.eventHandlerRuntime);
		//no element event
		} else {
			//remove from storage
			store.remove(this.context, name, handler);
		}
		//return self
		return this;
	};

	/**
	 * Interrupt
	 * @param {event} event
	 * @param {boolean} stopProp Stop propagation
	 * @param {boolean} cancelDef Cancel default
	 */
	Emitter.prototype.interrupt = function (event, stopProp, cancelDef) {
		if (stopProp) {
			stopPropagation(event);
		}
		if (cancelDef) {
			cancelDefault(event);
		}
	};

	/**
	 * In
	 * @param {Object} context
	 * @returns {Emitter}
	 */
	Emitter.prototype.in = function (context) {
		var isStatic = this.isStatic;
		//static
		if (isStatic) {
			throw "EventEmitter: Can not change context on static method. Use EventEmitter.create() with right context.";
		}
		//set new context
		this.context = context;
		//return it
		return this;
	};

	/**
	 * Set debug mode on / off
	 * @param {boolean} state
	 * @param {Array.<string>} filters
	 */
	Emitter.prototype.debugMode = function (state, filters) {
		debugFilters = filters;
		debugMode = state;
		console.info("EventEmitter debug mode is set to " + (state ? "on" : "off"));
	};

	//noinspection JSUnusedGlobalSymbols
	Emitter.prototype.version = "1.0";
	//return event
	return Emitter;

}(MQ));