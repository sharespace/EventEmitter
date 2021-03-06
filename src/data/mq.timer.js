/*global MQ*/
MQ.Timer = (function (MQ, p) {
	"use strict";

	/**
	 * Timer for emitter
	 * @param {number} timeout
	 * @param {function} callback
	 * @constructor
	 */
	function Timer(timeout, callback) {
		/** @type {number}*/
		this.timeout = timeout || 30;
		/** @type {number}*/
		this.timer = 0;
		/** @type {function}*/
		this.callback = callback;
	}

	//shortcut
	p = Timer.prototype;

	/**
	 * Run
	 */
	p.run = function () {
		//already running
		if (this.timer) {
			return;
		}
		//create timer
		this.timer = setTimeout(interval.bind(this, this.callback), this.timeout);
	};

	/**
	 * Cancel
	 */
	p.cancel = function () {
		//already running
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = 0;
		}
	};

	/**
	 * @this {Timer}
	 * @param {Function} handler
	 */
	function interval(handler) {
		//noinspection JSUnresolvedFunction
		this.cancel();
		handler();
	}

	//noinspection JSUnusedGlobalSymbols
	p.version = "1.0";
	return Timer;

}(MQ));