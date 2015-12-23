/*global MQ*/
MQ.Timer = (function (MQ, p) {
	"use strict";
	
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

    //shortcut
    p = Timer.prototype;

    /**
     * Run
     */
    p.run = function () {
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
    p.cancel = function () {
        //already running
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }
    };

    //noinspection JSUnusedGlobalSymbols
    p.version = "1.0";
    return Timer;

}(MQ));