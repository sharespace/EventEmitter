# EventEmitter

### Info
Message queue for events. Is used for sending events, requests, notify information and
binding events on dom elements. It is a minimalistic library (< 8kB min file) and is really
simple to use it.

### How to install

Download and install [NodeJs](https://nodejs.org/en/)

Run command `npm install`

### Test status on CodeShip
![CodeShip status](https://codeship.com/projects/3e312a00-5f7a-0133-10a2-5684d7134b37/status?branch=master "CodeShip status")

[CodeShip Continuous integration project](https://codeship.com/projects/111793)

### Methods

`.create(context)` - It's method for creating new emitter with given `context`. Context can be any object od any function. 
It is use for manipulation with handlers. More information in section "How to use it"

`.event(name, params)` - Call event with given `name` and send through given `params`. This function is call immediately
after you call it.

`.notify(name, params)` - Call notify with given `name` and send through given `params`. This function is same like `.event()`
but it can be called after same time. It's only notifier and you cannot determine when it's called, because there can be
timeout due to other events, requests or notify.

`.request(name, params)` - Call request with given `name` and send through given `params` and get return from this call.
This is similar to `.event()` but this function return value. This is a really special method and EventEmitter check if 
it's right called. If `.request()` has not any handler, than fail because without handler you can not get return value. Call
also fail if there are more handlers than one, because you can not get return value from more functions.

`.subscribe()` - This method is used for subscribing for events, that are triggered by `.event()`, `.notify()` or `.request()`.
You can use it for your custom events or bind it to dom element. More information in section "How to use it"

`.unsubscribe()` - This method is used for stop listening for events, that are triggered by `.event()`, `.notify()` or `.request()`.
More information in section "How to use it"

`.interrupt(event, stopProp, cancelDef)` - This function is used to stop browser event. There are parameters for stop propagation
and cancel default action. It's helper function.

`.debugMode(state, filters)` - You can turn on debug mode and filter some specific events. Other events will be writen into
 browser console with all parameters.

### How to use it

You can use this library in global way. There is global variable `EventEmitter`. 

