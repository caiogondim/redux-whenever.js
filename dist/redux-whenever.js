(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var safeChain = require('@caiogondim/safe-chain');

var getStateSubtree = function getStateSubtree(state, selector) {
  if (state === undefined) {
    return undefined;
  }if (typeof selector === 'string') {
    return safeChain(state, selector);
  } else if (typeof selector === 'function') {
    return selector(state);
  } else {
    throw new TypeError('selector must be a string or function');
  }
};

var conditionsAreMet = function conditionsAreMet(assertion, curStateSubtree, prevStateSubtree) {
  if (curStateSubtree === prevStateSubtree) return false;

  if (typeof assertion === 'function') {
    return Boolean(assertion(curStateSubtree));
  } else {
    return curStateSubtree === assertion;
  }
};

//
// API
//

var enhancer = function enhancer(createStore) {
  var prevState = void 0;
  var listeners = [];

  return function (reducer, preloadedState) {
    var store = createStore(reducer, preloadedState);

    store.whenever = function (selector, assertion, callback) {
      var length = listeners.push({
        selector: selector,
        assertion: assertion,
        callback: callback
      });
      var index = length - 1;

      return function () {
        return listeners.splice(index, 1);
      };
    };

    store.subscribe(function () {
      var curState = store.getState();

      listeners.forEach(function (listener) {
        var curStateSubtree = getStateSubtree(curState, listener.selector);
        var prevStateSubtree = getStateSubtree(prevState, listener.selector);

        if (conditionsAreMet(listener.assertion, curStateSubtree, prevStateSubtree)) {
          listener.callback(curStateSubtree, prevStateSubtree);
        }
      });

      prevState = curState;
    });

    return store;
  };
};

module.exports = enhancer;

},{"@caiogondim/safe-chain":2}],2:[function(require,module,exports){
'use strict';

var quoteQuery = function quoteQuery(query) {
  return query.replace(/\[/g, '[\'').replace(/]/g, '\']');
};

var queryObj = function queryObj(obj, query) {
  var prop = void 0;
  var quotedQuery = quoteQuery(query);

  try {
    if (query[0] === '[') {
      prop = eval('obj' + quotedQuery); // eslint-disable-line no-eval
    } else {
      prop = eval('obj.' + query); // eslint-disable-line no-eval
    }
  } catch (error) {
    prop = undefined;
  }

  return prop;
};

//
// API
//

var safeChain = function safeChain(obj, query) {
  return queryObj(obj, query);
};

module.exports = safeChain;

},{}]},{},[1]);
