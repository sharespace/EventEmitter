/*global console, MQ*/
MQ.Store = (function (MQ) {
	"use strict";

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
				if (handler && record.context === context && record.handler === handler) {
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
			removeByName(store, context, name, handler);
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

}(MQ));