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

it('should fire callback when observed node changes to desired value', () => {
  const store = redux.createStore(reducer, reduxWhenever)
  const subscribeCallbackSpy = createSpy()
  const wheneverCallbackSpy = createSpy()

  store.subscribe(subscribeCallbackSpy)
  store.whenever('foo.bar', true, wheneverCallbackSpy)

  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: 1 }
    }
  })
  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: 2 }
    }
  })
  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: true }
    }
  })

  expect(subscribeCallbackSpy.callCount).toBe(3)
  expect(wheneverCallbackSpy.callCount).toBe(1)
})

it('should not fire callback when store changes but observed node dont', () => {
  const store = redux.createStore(reducer, reduxWhenever)
  const subscribeCallbackSpy = createSpy()
  const wheneverCallbackSpy = createSpy()

  store.subscribe(subscribeCallbackSpy)
  store.whenever('foo.bar', true, wheneverCallbackSpy)

  store.dispatch({
    type: 'LOREM',
    payload: {
      lorem: { ipsum: 1 }
    }
  })
  store.dispatch({
    type: 'LOREM',
    payload: {
      lorem: { ipsum: 2 }
    }
  })

  expect(subscribeCallbackSpy.callCount).toBe(2)
  expect(wheneverCallbackSpy.callCount).toBe(0)
})

it('should not fire callback when store changes but observed node maintains desired value', () => {
  const store = redux.createStore(reducer, reduxWhenever)
  const subscribeCallbackSpy = createSpy()
  const wheneverCallbackSpy = createSpy()

  store.subscribe(subscribeCallbackSpy)
  store.whenever('foo.bar', true, wheneverCallbackSpy)

  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: 1 }
    }
  })
  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: true }
    }
  })
  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: true }
    }
  })
  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: 2 }
    }
  })

  expect(subscribeCallbackSpy.callCount).toBe(4)
  expect(wheneverCallbackSpy.callCount).toBe(1)
})

it('should return a function to unsubscribe listener', () => {
  const store = redux.createStore(reducer, reduxWhenever)
  const wheneverCallbackSpy = createSpy()

  const unsubscribe = store.whenever('foo.bar', true, wheneverCallbackSpy)

  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: true }
    }
  })
  expect(wheneverCallbackSpy.callCount).toBe(1)

  unsubscribe()
  store.dispatch({
    type: 'LOREM',
    payload: {
      foo: { bar: true }
    }
  })
  expect(wheneverCallbackSpy.callCount).toBe(1)
})

describe('selector', () => {
  it('should query state if is a string', () => {
    const store = redux.createStore(reducer, reduxWhenever)
    const wheneverCallbackSpy = createSpy()

    store.whenever('foo.bar', true, wheneverCallbackSpy)

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: true }
      }
    })

    expect(wheneverCallbackSpy.callCount).toBe(1)
  })

  it('should run selector if is a function', () => {
    const store = redux.createStore(reducer, reduxWhenever)
    const wheneverCallbackSpy = createSpy()
    const selector = (state) => state.foo.bar

    store.whenever(selector, true, wheneverCallbackSpy)

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: true }
      }
    })

    expect(wheneverCallbackSpy.callCount).toBe(1)
  })

  it('should throw an error if not a string or function', () => {
    const store = redux.createStore(reducer, reduxWhenever)
    const wheneverCallbackSpy = createSpy()
    const selector = {}

    store.whenever(selector, true, wheneverCallbackSpy)

    try {
      store.dispatch({
        type: 'LOREM',
        payload: {
          foo: { bar: true }
        }
      })
    } catch (error) {
      expect(error.constructor).toBe(TypeError)
    }
  })
})

describe('assertion', () => {
  it('should not fire callback if assertion is a function and returns false', () => {
    const store = redux.createStore(reducer, reduxWhenever)
    const wheneverCallbackSpy = createSpy()
    const assertion = () => false

    store.whenever('foo.bar', assertion, wheneverCallbackSpy)

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: true }
      }
    })
    expect(wheneverCallbackSpy.callCount).toBe(0)
  })

  it('should fire callback if assertion is a function and returns true', () => {
    const store = redux.createStore(reducer, reduxWhenever)
    const wheneverCallbackSpy = createSpy()
    const assertion = () => true

    store.whenever('foo.bar', assertion, wheneverCallbackSpy)

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: true }
      }
    })
    expect(wheneverCallbackSpy.callCount).toBe(1)
  })

  it('should receive a state subtree as argument', () => {
    const store = redux.createStore(reducer, reduxWhenever)
    const wheneverCallbackSpy = createSpy()
    const assertion = (state) => {
      expect(state).toEqual({ bar: true })
    }

    store.whenever('foo', assertion, wheneverCallbackSpy)

    store.dispatch({
      type: 'LOREM',
      payload: {
        foo: { bar: true }
      }
    })
  })
})
