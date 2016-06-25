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

#### .create(context)

It's method for creating new emitter with given `context`. Context can be any object od any function. 
It is use for manipulation with handlers. More information in section "How to use it"

#### .event(name, params)

Call event with given `name` and send through given `params`. This function is call immediately
after you call it.

#### .notify(name, params)

Call notify with given `name` and send through given `params`. This function is same like `.event()`
but it can be called after same time. It's only notifier and you cannot determine when it's called, because there can be
timeout due to other events, requests or notify.

#### .request(name, params)

Call request with given `name` and send through given `params` and get return from this call.
This is similar to `.event()` but this function return value. This is a really special method and EventEmitter check if 
it's right called. If `.request()` has not any handler, than fail because without handler you can not get return value. Call
also fail if there are more handlers than one, because you can not get return value from more functions.

#### .demand(name, params)

Call request with given `name` and send through given `params` and get return from this call.
This is similar to `.request()` but this function return value and event return `undefined`. If `.demand()` has not 
any handler, than do not fail and return `undefined`. Call also fail if there are more handlers than one, 
because you can not get return value from more functions.

#### .subscribe()

This method is used for subscribing for events, that are triggered by `.event()`, `.notify()` or `.request()`.
You can use it for your custom events or bind it to dom element. More information in section "How to use it"

#### .unsubscribe()

This method is used for stop listening for events, that are triggered by `.event()`, `.notify()` or `.request()`.
More information in section "How to use it"

#### .interrupt(event, stopProp, cancelDef)

This function is used to stop browser event. There are parameters for stop propagation
and cancel default action. It's helper function.

#### .debugMode(state, filters)

You can turn on debug mode and filter some specific events. Other events will be writen into
 browser console with all parameters.

### How to use it

You can use this library in global way. There is global variable `EventEmitter`. 

#### Example 1

```javascript
EventEmitter.subscribe("MyEvent", function (data) {
    console.log("You handler for event");
});
EventEmitter.event("MyEvent");
EventEmitter.event("MyEvent", [true, "param2"]);
```

In this example you can see basic usages of emitter. You can subscribe for event and call event with or without parameters.
But there are two main problems. You can not destroy this handler for MyEvent, because you don't have original handler and also 
you don't have context, so in handler is invalid pointer on `this`. We can make modification for first problem.

#### Example 1 - first problem solve

```javascript
var handler = function (data) {
  console.log("You handler for event");
};
EventEmitter.subscribe("MyEvent", handler);
EventEmitter.event("MyEvent");
EventEmitter.event("MyEvent", [true, "param2"]);
EventEmitter.unsubscribe("MyEvent", handler);
```

So now we can unsubscribe our event. Now we must solve the second problem. Context.

#### Example 1 - second problem solve

```javascript
var emitter,
    context = {},
    handler = function (data) {
  console.log("You handler for event with context from 'context' variable.");
};
emitter = EventEmitter.create(context);
emitter.subscribe("MyEvent", handler);
emitter.event("MyEvent");
emitter.event("MyEvent", [true, "param2"]);
emitter.unsubscribe("MyEvent", handler);
```

Now we have solve second problem. This is the recommended use of EventEmitter. In every file create new instance with
`this` as a context. If you implemented destroy on object, you can call `emitter.unsubscribe()` and all handlers for context
will be destroyed. So we can update last example for complete clean all events.

#### Example 2

```javascript
var emitter,
    context = {},
    handler = function (data) {
  console.log("You handler for event wit context from 'context' variable.");
};
emitter = EventEmitter.create(context);
emitter.subscribe("MyEvent", handler);
emitter.subscribe("MyEventSecond", handler);
emitter.event("MyEvent");
emitter.event("MyEvent", [true, "param2"]);
emitter.unsubscribe();
```

And last part is binding to DOM elements. It's easy like others thing before.


#### Example 3

```javascript
var emitter,
    context = {},
    handler = function (data) {
  console.log("Clicked on body and destroy.");
  emitter.unsubscribe();
  //emitter.unsubscribe(document.body, "click", handler);
};
emitter = EventEmitter.create(context);
emitter.subscribe(document.body, "click", handler);
```
# Licence

MIT License

Copyright (c) 2015 Stanislav Hacker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The Software shall be used for Good, not Evil.
