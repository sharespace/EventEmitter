var MQ = (function () {
	"use strict";
	return {};
}());;MQ.Timer = (function (MQ) {
    /** @type {Object}*/
    var Timer;

    /**
     * Timer for emitter
     * @param {number} timeout
     * @param {function} callback
     * @constructor
     */
    Timer = function (timeout, callback) {
        /** @type {number}*/
        this.timeout = timeout || 30;
        /** @type {number}*/
        this.timer = 0;
        /** @type {function}*/
        this.callback = callback;
    };

    /**
     * Run
     */
    Timer.prototype.run = function () {
        var self = this,
            handler = this.callback;
        //already running
        if (this.timer) {
            return;
        }
        //create timer
        this.timer = setTimeout(function () {
            self.cancel();
            handler();
        }, this.timeout);
    };

    /**
     * Cancel
     */
    Timer.prototype.cancel = function () {
        //already running
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }
    };

    //noinspection JSUnusedGlobalSymbols
    Timer.prototype.version = "1.0";
    return Timer;

}(MQ));;MQ.Store = (function (MQ) {
	/** @type {Object}*/
	var Store,
		StoreRecord;

	/**
	 * Event name create
	 * @param {Object} store
	 * @param {string} name
	 * @returns {Array.<StoreRecord>}
	 */
	function event(store, name) {
		var data = store[name];
		//events not exists
		if (!data) {
			data = [];
			store[name] = data;
		}
		return data;
	}

	//noinspection JSValidateJSDoc
	/**
	 * Load based on context
	 * @param {Array.<StoreRecord>} data
	 * @param {Object} params
	 */
	function evaluate(data, params) {
		//iterate
		var i,
			record,
			length = data.length;

		for (i = 0; i < length; i++) {
			//record
			record = data[i];
			//check if is valid
			record.handler.apply(record.context, params ? [params] : []);
		}
	}

	//noinspection JSValidateJSDoc
	/**
	 * Request based on context
	 * @param {Array.<StoreRecord>} data
	 * @param {string} name
	 * @param {Object} params
	 * @return {Object}
	 */
	function request(data, name, params) {
		var record,
			result,
			length = data.length;

		//error
		if (length === 0) {
			throw "EventEmitter: Can not make request on event that has not handler for '" + name + "'.";
		}
		if (length > 1) {
			throw "EventEmitter: Can not make request on event that has more then one handler. Use EventEmitter.event('" + name + "') instead.";
		}
		//get record
		record = data[0];
		//check if is valid
		result =  record.handler.apply(record.context, params ? [params] : []);
		//no return
		if (result === undefined) {
			console.warn("EventEmitter: Return from request '" + name + "' is empty! This is might not be valid state.");
		}
		//return
		return result;
	}

	//noinspection JSValidateJSDoc
	/**
	 * Remove by name
	 * @param {Object.<string, Array.<StoreRecord>>} store
	 * @param {Object} context
	 * @param {string} name
	 * @param {function=} handler
	 */
	function removeByName(store, context, name, handler) {
		var i,
			record,
			data = event(store, name),
			length = data.length;

		//clear all, no context set
		if (context === MQ._default) {
			data.length = 0;
		} else {
			//iterate all
			for (i = length - 1; i >= 0; i--) {
				//record
				record = data[i];
				//remove right context and right handler
				if (handler && record.context === context && record.handler == handler) {
					data.splice(i, 1);
				}
				//remove right context
				if (!handler && record.context === context) {
					data.splice(i, 1);
				}
			}
		}
	}

	//noinspection JSValidateJSDoc
	/**
	 * Remove by context
	 * @param {Object.<string, Array.<StoreRecord>>} store
	 * @param {Object} context
	 */
	function removeByContext(store, context) {
		var i,
			key,
			data,
			record,
			length,
			isDefault = context === MQ._default;

		for (key in store) {
			if (store.hasOwnProperty(key)) {
				//load data
				data = store[key];
				length = data.length;
				//iterate all
				for (i = length - 1; i >= 0; i--) {
					//record
					record = data[i];
					//remove right context
					if (record.context === context || isDefault) {
						data.splice(i, 1);
					}
				}
			}
		}
	}

	//noinspection JSValidateJSDoc
	/**
	 * Remove
	 * @param {Object.<string, Array.<StoreRecord>>} store
	 * @param {Object} context
	 * @param {string=} name
	 * @param {function=} handler
	 */
	function remove(store, context, name, handler) {
		//remove by name
		if (name !== undefined && name !== null) {
			removeByName(store, context, name, handler)
		} else {
			removeByContext(store, context);
		}
	}

	/**
	 * Start record
	 * @param {Object} context
	 * @param {Function} handler
	 * @constructor
	 */
	StoreRecord = function (context, handler) {
		this.context = context;
		this.handler = handler;
	};

	/**
	 * Store for emitter
	 * @constructor
	 */
	Store = function () {
		/** @type {Object.<string, Array.<StoreRecord>>}*/
		this.store = {};
	};

	/**
	 * Save
	 * @param {Object} context
	 * @param {string} name
	 * @param {function} handler
	 */
	Store.prototype.save = function (context, name, handler) {
		//normalize
		name = name.toLowerCase();
		//get store
		event(this.store, name).push(new StoreRecord(context, handler));
	};

	/**
	 * Remove
	 * @param {Object} context
	 * @param {string=} name
	 * @param {function=} handler
	 */
	Store.prototype.remove = function (context, name, handler) {
		//normalize
		name = name ? name.toLowerCase() : name;
		//get store
		remove(this.store, context, name, handler);
	};

	/**
	 * Evaluate
	 * @param {string} name
	 * @param {Object} params
	 */
	Store.prototype.evaluate = function (name, params) {
		//normalize
		name = name.toLowerCase();
		//evaluate
		evaluate(event(this.store, name), params);
	};

	/**
	 * Request
	 * @param {string} name
	 * @param {Object} params
	 * @return {Object}
	 */
	Store.prototype.request = function (name, params) {
		//normalize
		name = name.toLowerCase();
		//evaluate
		return request(event(this.store, name), name, params);
	};

	//noinspection JSUnusedGlobalSymbols
	Store.prototype.version = "1.0";
	return Store;

}(MQ));;MQ.Emitter = (function (MQ) {
	/** @type {Object}*/
	var Emitter,
		debugFilters = [],
		debugMode = false,
		store = new MQ.Store(),
		//triple click data
		clickCount = 0,
		clickStart = 0;

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
		//tripleclick
		if (eventType === "tripleclick") {
			addTripleClick(element, handler);
			return;
		}

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
		//tripleclick
		if (eventType === "tripleclick") {
			removeTripleClick(element, handler);
			return;
		}
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
	 * Add triple click
	 * @param {Element} el
	 * @param {Function} handler
	 */
	function addTripleClick (el, handler) {
		/**
		 * Triple click dblclick handler
		 * @param {Event} event
		 */
		handler.tripleDblClickHandler = function (event) {
			if (!document.body.addEventListener) {
				//noinspection JSUnresolvedFunction
				handler.tripleClickHandler(event || window.event);
			}
		};
		/**
		 * Triple click click handler
		 * @param {Event} event
		 */
		handler.tripleClickHandler = function (event) {
			//event convert
			event = event || window.event;
			//check date
			if (clickStart > (new Date()).getTime() - 700) {
				clickCount += 1;
				if (clickCount === 3) {
					clickCount = 0;
					handler(event);
				}
			} else {
				clickCount = 1;
				clickStart = 0;
			}
			//click start
			if (!clickStart) {
				clickStart = new Date().getTime();
			}
		};
		//noinspection JSUnresolvedVariable
		addEvent(el, "click", handler.tripleClickHandler);
		//noinspection JSUnresolvedVariable
		addEvent(el, "dblclick", handler.tripleDblClickHandler);
	}

	/**
	 * Remove triple click
	 * @param {Element} el
	 * @param {Function} handler
	 */
	function removeTripleClick (el, handler) {
		//noinspection JSUnresolvedVariable
		removeEvent(el, "click", handler.tripleClickHandler);
		//noinspection JSUnresolvedVariable
		removeEvent(el, "dblclick", handler.tripleDblClickHandler);
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

}(MQ));;//EventEmitter create
var EventEmitter = new MQ.Emitter(true);