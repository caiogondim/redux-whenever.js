// TODO
// - remove listener
// - deep-equal library

const logger = require('logdown')({ prefix: 'redux-whenever' })
const safeChain = require('@caiogondim/safe-chain')

const getStateSubtree = (state, selector) => {
  if (state === undefined) {
      return undefined
  } if (typeof selector === 'string') {
    return safeChain(state, selector)
  } else if (typeof selector === 'function') {
    return selector(state)
  } else {
    throw new TypeError('selector must be a string or function')
  }
}

const enhancer = (createStore) => {
  let prevState;
  let listeners = []

  return (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState)

    store.whenever = (selector, assertion, callback) => {
      listeners.push({
        selector,
        assertion,
        callback
      })
    }

    store.subscribe(() => {
      const curState = store.getState()

      listeners.forEach(listener => {
        const curStateNode = getStateSubtree(curState, listener.selector)
        const prevStateNode = getStateSubtree(prevState, listener.selector)

        if (
          curStateNode !== prevStateNode &&
          curStateNode === listener.assertion
        ) {
          listener.callback(curStateNode, prevStateNode)
        }
      })

      prevState = curState
    })

    return store
  }
}

module.exports = enhancer
