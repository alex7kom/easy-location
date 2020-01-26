# Easy Location

[![Build Status](https://travis-ci.org/Alex7Kom/easy-location.svg?branch=master)](https://travis-ci.org/Alex7Kom/easy-location)

A thin layer above window.history and window.location APIs for easier URL manipulation.

## Motivation

I didn't like other libraries, because they want to own route state, which goes against the Redux principle of 'single source of truth'. Easy Location instead is a thin layer that works with Redux store directly and constructs URL from the store data.

That said, Easy Location knows nothing about React or Redux and you can use it with anything else.

## Installation

```sh
npm install easy-location
```

or

```sh
yarn add easy-location
```

## Usage

The library exposes `initEasyLocation` function which returns `easyLocation` object and accepts an object with two callbacks:

* `onChange(data)` is called first on init and then on `window`'s `popstate` event. `data` is an object with data extracted from URL, for example, for `https://example.com/apps/hello/?name=John` the data will be:

```json
{
  "path": ["apps", "hello"],
  "search": {
    "name": "John"
  }
}
```

`path` is an array with `window.location.pathname` parts.

`search` is an object with `window.location.search` pairs.

* `onNewUrl(url)` is called when URL is changed, with `popstate` or `reflect()`. `url` is a full URL which you can feed to some analytics system.

### `easyLocation#reflect(data)`

Constructs a new URL from the provided `data`. `data` is an object with `path` and `search` properties, in fact, it's format is the same with the object with which `onChange(data)` is called. Both `path` and `search` are optional, and if not provided those parts of URL will not be changed.

### `easyLocation#unmount()`

Remove Easy Location listeners from window. `onChange` and `onNewUrl` will not be called after calling this function.

## Redux Example

```js
import { createStore, combineReducers } from 'redux';
import initEasyLocation from 'easy-location';

// Create a Redux store with reducers that handle URL_CHANGE action
const store = createStore(combineReducers({
  searchQuery: (state = '', action) => {
    switch (action.type) {
      case 'URL_CHANGE':
        return action.data.search.query;
      default:
        return state;
    }
  },
  deepSearch: (state = false, action) => {
    switch (action.type) {
      case 'URL_CHANGE':
        return action.data.search.deep === '1';
      default:
        return state;
    }
  }
}));

const easyLocation = initEasyLocation({
  // dispatch an action on URL change
  onChange: (data) => {
    store.dispatch({
      type: 'URL_CHANGE',
      data: data
    });
  }
});

// transform state
const callReflect = () => {
  const state = store.getState();

  easyLocation.reflect({
    search: {
      query: state.searchQuery,
      deep: Number(state.deepSearch)
    }
  });
};

// subscribe on store updates so we can update URL on store changes
store.subscribe(callReflect);

// If you want to reflect default state
callReflect();
```

## License

The MIT License (MIT)

Copyright (c) 2017 Alexey Komarov <alex7kom@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
