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

  it('should update `prevState` when actions are dispatched recursively', () => {
    const store = redux.createStore(reducer, reduxWhenever)

    store.whenever('foo.bar', () => true, (curState, prevState) => {
      if (curState === 3) {
        expect(prevState).toBe(2)
        return;
      }

      store.dispatch({
        type: 'LOREM',
        payload: {
          foo: { bar: curState + 1 }
        }
      })
    })

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: 1 }
      }
    })
  })

  it('should pass states correctly to all subscribers when actions are dispatched recursively', () => {
    const store = redux.createStore(reducer, reduxWhenever)

    store.whenever('foo.bar', () => true, (curState, prevState) => {
      if (curState === 5) {
        return;
      }
      store.dispatch({
        type: 'LOREM',
        payload: {
          foo: { bar: curState + 1 }
        }
      })
    })

    const callback = jest.fn()
    store.whenever('foo.bar', () => true, (curState, prevState) => {
      callback(curState, prevState)
      if (curState === 5) {
        expect(callback).toHaveBeenCalledWith(1, undefined)
        expect(callback).toHaveBeenCalledWith(2,1)
        expect(callback).toHaveBeenCalledWith(3,2)
        expect(callback).toHaveBeenCalledWith(4,3)
        expect(callback).toHaveBeenCalledWith(5,4)
      }
    })

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: 1 }
      }
    })

    expect(callback).toHaveBeenCalledTimes(5)
  })
})
