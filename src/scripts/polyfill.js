const arrayFrom = require('array-from');
const es6promise = require('es6-promise');
const arrayFill = require('core-js/library/fn/array/fill');

/**
 *
 *
 * array-from
 * es6-promise
 * core-js (array.fill)
 */
export function runPolyfills() {
  if (!Array.from) {
    console.info('####', 'Array.from polyfilled');
    Array.from = arrayFrom;
  }
  if (!window.Promise) {
    console.info('####', 'Promise polyfilled');
    es6promise.polyfill();
  }
  if (![].fill) {
    console.info('####', 'Array.fill polyfilled');
    Array.prototype.fill = arrayFill;
  }
}

