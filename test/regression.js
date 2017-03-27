/* eslint-env jest */

const redux = require('redux')
const reduxWhenever = require('../src')

//
// Helpers
//

const reducer = (state = {}, action) => {
  return Object.assign({}, action.payload)
}

const createSpy = () => {
  const spy = () => (spy.callCount += 1)
  spy.callCount = 0

  return spy
}

//
// Tests
//

describe('regression', () => {
  it('should update `prevState` when actions are dispatched inside subscriber', () => {
    const store = redux.createStore(reducer, reduxWhenever)

    store.whenever('foo.bar', true, (curState, prevState) => {
      store.dispatch({
        type: 'LOREM',
        payload: {
          foo: { bar: false }
        }
      })
    })

    store.whenever('foo.bar', false, (curState, prevState) => {
      expect(prevState).toBe(true)
    })

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: true }
      }
    })
  })
})
