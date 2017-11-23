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

    const postponedActions = []
    let unsubscribePostprocess = null
    let recursionLevel = 0

    store.whenever = (selector, assertion, callback) => {
      const originalDispatch = store.dispatch

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
