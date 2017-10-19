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

    const originalDispatch = store.dispatch
    let postponedActions = []
    let sequence = 0
    let recursionLevel = 0

    store.whenever = (selector, assertion, callback) => {
      const id = ++sequence
      return store.subscribe(() => {
        ++recursionLevel

        store.dispatch = function() {
          postponedActions.push(arguments)
        }

        curState = store.getState()
        const curStateSubtree = getStateSubtree(curState, selector)
        const prevStateSubtree = getStateSubtree(prevState, selector)

        if (conditionsAreMet(assertion, curStateSubtree, prevStateSubtree)) {
          callback(curStateSubtree, prevStateSubtree)
        }

        // Only the last one subscribed without recursion should dispatch the actions
        if (id === sequence && recursionLevel === 1) {
          for (let i = 0; i < postponedActions.length; ++i) {
            originalDispatch.apply(store, postponedActions[i])
          }

          postponedActions = []
          store.dispatch = originalDispatch
        }

        --recursionLevel
      })
    }

    return store
  }
}

module.exports = enhancer
