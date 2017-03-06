// TODO
// - remove listener
// - deep-equal library

const redux = require('redux')
const logger = require('logdown')({ prefix: 'redux-whenever' })
const safeChain = require('@caiogondim/safe-chain')

console.log('')

const reducer = (state = {}, action) => {
  return Object.assign({}, action.payload)
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
        const curStateNode = safeChain(curState, listener.selector)
        const prevStateNode = safeChain(prevState, listener.selector)

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

const store = redux.createStore(reducer, enhancer)

store.subscribe(() => {
  logger.log(store.getState())
})

const callback = (curState, prevState) => {
  logger.log('changed', {curState, prevState})
}

store.whenever('foo.bar', true, callback)

store.dispatch({ type: 'LOREM', payload: {
  foo: { bar: 3 }
}})

store.dispatch({ type: 'LOREM', payload: {
  foo: { bar: 4 }
}})

store.dispatch({ type: 'LOREM', payload: {
  foo: { bar: true }
}})

store.dispatch({ type: 'LOREM', payload: {
  foo: { bar: 5 }
}})

store.dispatch({ type: 'LOREM', payload: {
  foo: { bar: 6 }
}})

store.dispatch({ type: 'LOREM', payload: {
  foo: { bar: true }
}})
