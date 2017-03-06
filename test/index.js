const redux = require('redux')
const reduxWhenever = require('../src')

//
// Helpers
//

const reducer = (state = {}, action) => {
  return Object.assign({}, action.payload)
}

const createSpy = () => {
  const spy = () => spy.callCount += 1
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

  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: 1 }
  }})
  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: 2 }
  }})
  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: true }
  }})

  expect(subscribeCallbackSpy.callCount).toBe(3)
  expect(wheneverCallbackSpy.callCount).toBe(1)
})

it('should not fire callback when store changes but observed node dont', () => {
  const store = redux.createStore(reducer, reduxWhenever)

  const subscribeCallbackSpy = createSpy()
  const wheneverCallbackSpy = createSpy()

  store.subscribe(subscribeCallbackSpy)
  store.whenever('foo.bar', true, wheneverCallbackSpy)

  store.dispatch({ type: 'LOREM', payload: {
    lorem: { ipsum: 1 }
  }})
  store.dispatch({ type: 'LOREM', payload: {
    lorem: { ipsum: 2 }
  }})

  expect(subscribeCallbackSpy.callCount).toBe(2)
  expect(wheneverCallbackSpy.callCount).toBe(0)
})

it('should not fire callback when store changes but observed node maintains desired value', () => {
  const store = redux.createStore(reducer, reduxWhenever)

  const subscribeCallbackSpy = createSpy()
  const wheneverCallbackSpy = createSpy()

  store.subscribe(subscribeCallbackSpy)
  store.whenever('foo.bar', true, wheneverCallbackSpy)

  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: 1 }
  }})
  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: true }
  }})
  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: true }
  }})
  store.dispatch({ type: 'LOREM', payload: {
    foo: { bar: 2 }
  }})

  expect(subscribeCallbackSpy.callCount).toBe(4)
  expect(wheneverCallbackSpy.callCount).toBe(1)
})

it.skip('should play well with other enhancers', () => {

})
