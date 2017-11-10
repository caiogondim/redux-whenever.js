(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.reduxWhenever = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const quoteQuery = (query) => {
  return query
    .replace(/\[/g, '[\'')
    .replace(/]/g, '\']')
}

const queryObj = (obj, query) => {
  let prop
  const quotedQuery = quoteQuery(query)

  try {
    if (query[0] === '[') {
      prop = eval(`obj${quotedQuery}`) // eslint-disable-line no-eval
    } else {
      prop = eval(`obj.${query}`) // eslint-disable-line no-eval
    }
  } catch (error) {
    prop = undefined
  }

  return prop
}

//
// API
//

const safeChain = (obj, query) => queryObj(obj, query)

module.exports = safeChain

},{}],2:[function(require,module,exports){
const safeChain = require('safe-chain')

const getStateSubtree = (state, selector) => {
  if (typeof selector === 'string') {
    return safeChain(state, selector)
  } else if (typeof selector === 'function') {
    return selector(state)
  } else {
    throw new TypeError('selector must be a string or function')
  }
}

const conditionsAreMet = (assertion, curStateSubtree, prevStateSubtree) => {
  if (curStateSubtree === prevStateSubtree) return false

  if (typeof assertion === 'function') {
    return Boolean(assertion(curStateSubtree))
  } else {
    return curStateSubtree === assertion
  }
}

//
// API
//

const enhancer = (createStore) => {
  return (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState)
    let prevState
    let curState = store.getState()

    store.subscribe(() => {
      prevState = curState
    })

    const originalDispatch = store.dispatch
    const postponedActions = []
    let unsubscribePostprocess = null
    let recursionLevel = 0

    store.whenever = (selector, assertion, callback) => {
      const unsubscribe = store.subscribe(() => {
        ++recursionLevel

        store.dispatch = function () {
          postponedActions.push(arguments)
        }

        curState = store.getState()
        const curStateSubtree = getStateSubtree(curState, selector)
        const prevStateSubtree = getStateSubtree(prevState, selector)

        if (conditionsAreMet(assertion, curStateSubtree, prevStateSubtree)) {
          callback(curStateSubtree, prevStateSubtree)
        }

        --recursionLevel
      })

      // we always keep a subscription at the end.
      // this is for dispatching the actions
      unsubscribePostprocess && unsubscribePostprocess()
      unsubscribePostprocess = store.subscribe(() => {
        // only without recursion should dispatch the actions
        if (recursionLevel !== 0) {
          return
        }

        recursionLevel = undefined

        for (let i = 0; i < postponedActions.length; ++i) {
          originalDispatch.apply(store, postponedActions[i])
        }

        postponedActions.length = 0
        store.dispatch = originalDispatch
        recursionLevel = 0
      })

      return unsubscribe
    }

    return store
  }
}

module.exports = enhancer

},{"safe-chain":1}]},{},[2])(2)
});