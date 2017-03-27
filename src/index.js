const safeChain = require('safe-chain')

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
    let prevState = undefined
    let curState = undefined

    store.subscribe(() => {
      prevState = curState
    })

    store.whenever = (selector, assertion, callback) => {
      return store.subscribe(() => {
        curState = store.getState()
        const curStateSubtree = getStateSubtree(curState, selector)
        const prevStateSubtree = getStateSubtree(prevState, selector)

        if (conditionsAreMet(assertion, curStateSubtree, prevStateSubtree)) {
          callback(curStateSubtree, prevStateSubtree)
        }
      })
    }

    return store
  }
}

module.exports = enhancer
