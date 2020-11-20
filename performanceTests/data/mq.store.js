/*global MQ, describe, it, beforeEach*/
describe("The MQ.Store", function () {
	"use strict";

	describe("Performance when large amount of handlers", function () {
		describe("remove by name", function () {
			var i,
				eventName = "myevent",
				ctx,
				eventHandler,
				store = new MQ.Store(),
				items;

			beforeEach(function () {
				items = [];
				i = 0;
				while (i < 5000) {
					ctx = {};
					eventHandler = function () {
					};
					items.push({
						ctx: ctx,
						eventHandler: eventHandler
					});
					store.save(ctx, eventName, eventHandler);
					i++;
				}
			});

			it("remove from begin", function () {
				var item,
					start = performance.now(),
					end;

				// console.log(store.store);
				for (i = 0; i < items.length; i++) {
					item = items[i];
					store.remove(item.ctx, eventName, item.eventHandler);
				}
				end = performance.now();
				// console.log(store.store);
				// console.log("time took: ", end - start);
				expect(store.store[eventName].length).toBe(0);
				expect(end - start).toBeLessThan(500);
			});

			it("remove from end", function () {
				var item,
					start = performance.now(),
					end;

				// console.log(store.store);
				for (i = items.length - 1; i >= 0; i--) {
					item = items[i];
					store.remove(item.ctx, eventName, item.eventHandler);
				}
				end = performance.now();
				// console.log(store.store);
				// console.log("time took: ", end - start);
				expect(store.store[eventName].length).toBe(0);
				expect(end - start).toBeLessThan(500);
			});

			it("remove from begin shuffled", function () {
				var item,
					start,
					end;

				shuffleArray(items);

				start = performance.now();
				// console.log(store.store);
				for (i = 0; i < items.length; i++) {
					item = items[i];
					store.remove(item.ctx, eventName, item.eventHandler);
				}
				end = performance.now();
				// console.log(store.store);
				// console.log("time took: ", end - start);
				expect(store.store[eventName].length).toBe(0);
				expect(end - start).toBeLessThan(500);
			});
		});

		describe("remove by ctx", function () {
			var i,
				eventName = "myevent",
				ctx,
				eventHandler,
				store = new MQ.Store(),
				items;

			beforeEach(function () {
				items = [];
				i = 0;
				while (i < 5000) {
					ctx = {};
					eventHandler = function () {
					};
					items.push({
						ctx: ctx,
						eventHandler: eventHandler
					});
					store.save(ctx, eventName, eventHandler);
					i++;
				}
			});

			it("remove from begin", function () {
				var item,
					start = performance.now(),
					end;

				// console.log(store.store);
				for (i = 0; i < items.length; i++) {
					item = items[i];
					store.remove(item.ctx);
				}
				end = performance.now();
				// console.log(store.store);
				// console.log("time took: ", end - start);
				expect(store.store[eventName].length).toBe(0);
				expect(end - start).toBeLessThan(500);
			});

			it("remove from end", function () {
				var item,
					start = performance.now(),
					end;

				// console.log(store.store);
				for (i = items.length - 1; i >= 0; i--) {
					item = items[i];
					store.remove(item.ctx);
				}
				end = performance.now();
				// console.log(store.store);
				// console.log("time took: ", end - start);
				expect(store.store[eventName].length).toBe(0);
				expect(end - start).toBeLessThan(500);
			});

			it("remove from begin shuffled", function () {
				var item,
					start,
					end;

				shuffleArray(items);

				start = performance.now();
				// console.log(store.store);
				for (i = 0; i < items.length; i++) {
					item = items[i];
					store.remove(item.ctx);
				}
				end = performance.now();
				// console.log(store.store);
				// console.log("time took: ", end - start);
				expect(store.store[eventName].length).toBe(0);
				expect(end - start).toBeLessThan(500);
			});
		});

		/**
		 *  Randomize array in-place using Durstenfeld shuffle algorithm
		 *  @param {Array} array
		 */
		function shuffleArray(array) {
			var i, j, temp;

			for (i = array.length - 1; i > 0; i--) {
				j = Math.floor(Math.random() * (i + 1));
				temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
	});
});