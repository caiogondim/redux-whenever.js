<img src="https://cdn.rawgit.com/caiogondim/redux-whenever.js/9fab71b8/img/banner.svg">

<h1 align="center">redux-whenever.js</h1>

<div align="center">
<img src="http://travis-ci.org/caiogondim/redux-whenever.js.svg?branch=master" alt="Travis CI"> <img src="https://codecov.io/gh/caiogondim/redux-whenever.js/branch/master/graph/badge.svg" alt="Codecov"> <img src="http://img.badgesize.io/caiogondim/redux-whenever.js/master/dist/redux-whenever.min.js?compression=gzip">
</div>

<br>

Subscribe to a state subtree (or leaf) and run callbacks `whenever` it evaluates to a given value.

## Usage

### Adding subscriber

```js
const whenever = require('redux-whenever')
const redux = require('redux')

// Pass `whenever` as an enhancer
const store = redux.createStore(reducer, whenever)

// Pass the state selector you are interested in as a string.
// `callback` will execute only when `player.isReady` becames `true`
store.whenever('player.isReady', true, (curState, prevState) => {
  // Your magic here
})
```

### Removing subscriber
```js
const unsubscribe = store.whenever('player.isReady', true, callback)
unsubscribe() // Removes previously added listener
```

## API

### `const unsubscribe = store.whenever(selector, assertion, callback)`
Returns a function that, if called, removes the added subscriber.

#### `selector`
- type: `String|Function`

Should return a piece of the state tree

#### `assertion`
- type: `String|Number|Object|Function`

If a function, it will be executed. If not, it's equality will be compared against current state.

#### `callback`
- type: `Function`

## Installation

```
npm install --save redux-whenever
```

## Credits
- Icon by Scott Lewis from the Noun Project

---

[caiogondim.com](https://caiogondim.com) &nbsp;&middot;&nbsp;
GitHub [@caiogondim](https://github.com/caiogondim) &nbsp;&middot;&nbsp;
Twitter [@caio_gondim](https://twitter.com/caio_gondim)
