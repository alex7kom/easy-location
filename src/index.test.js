'use strict';

var initEasyLocation = require('.');

test('should call onChange callback on start', function(done) {
  initEasyLocation({
    onChange: function() {
      done();
    }
  });
});

test('should call onChange callback on popstate', function(done) {
  var firstRun = true;
  var loc = initEasyLocation({
    onChange: function() {
      if (firstRun) {
        firstRun = false;

        return;
      }
      done();
      loc.unmount();
    }
  });

  window.history.pushState({}, '', '?1');
  window.history.back();
});

test('should call onNewUrl callback on popstate', function(done) {
  var loc = initEasyLocation({
    onNewUrl: function() {
      done();
      loc.unmount();
    }
  });

  window.history.pushState({}, '', '?1');
  window.history.back();
});

test('should call onNewUrl callback if url is changed', function(done) {
  window.history.pushState({}, '', '/d/');

  var loc = initEasyLocation({
    onNewUrl: function(url) {
      expect(url).toEqual('http://localhost/d/?e=1');
      done();
      loc.unmount();
    }
  });

  loc.reflect({
    search: { e: 1 }
  });
});

test('should not call onNewUrl callback if url is unchanged', function(done) {
  window.history.pushState({}, '', '/e/?f=1');

  var loc = initEasyLocation({
    onNewUrl: function() {
      done(new Error('callback is called'));
    }
  });

  loc.reflect({
    path: ['e'],
    search: { f: 1 }
  });
  setTimeout(function() {
    done();
    loc.unmount();
  }, 0);
});

test.each([
  ['/', { path: [], search: {} }],
  [
    '/a/b/c/?d=1&e=2&f=3',
    {
      path: ['a', 'b', 'c'],
      search: {
        d: '1',
        e: '2',
        f: '3'
      }
    }
  ],
  [
    '/?a=1&lang=%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9&%E6%97%A5%E6%9C%AC%E8%AA%9E=false',
    { path: [], search: { a: '1', lang: 'русский', 日本語: 'false' } }
  ],
  [
    '/english/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/%E6%97%A5%E6%9C%AC%E8%AA%9E/',
    { path: ['english', 'русский', '日本語'], search: {} }
  ]
])('onChange gets correct data', function(path, data) {
  window.history.pushState({}, '', path);

  var loc = initEasyLocation({
    onChange: function(newData) {
      expect(newData).toEqual(data);
    }
  });
  loc.unmount();
});

test.each([
  ['/', '/a/', { path: ['a'] }],
  ['/', '/?a=1', { search: { a: '1' } }],
  [
    '/',
    '/a/b/c/?d=1&e=2&f=3',
    {
      path: ['a', 'b', 'c'],
      search: {
        d: '1',
        e: '2',
        f: '3'
      }
    }
  ],
  [
    '/',
    '/?a=1&lang=%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9&%E6%97%A5%E6%9C%AC%E8%AA%9E=false',
    { path: [], search: { a: '1', lang: 'русский', 日本語: 'false' } }
  ],
  [
    '/',
    '/english/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/%E6%97%A5%E6%9C%AC%E8%AA%9E/',
    { path: ['english', 'русский', '日本語'], search: {} }
  ],
  // eslint-disable-next-line no-undefined
  ['/?a=0&d=8&f=7&s=9', '/?a=0&f=7&s=9', { search: { d: undefined } }]
])('reflect sets correct url', function(initial, path, data, done) {
  window.history.pushState({}, '', initial);

  var loc = initEasyLocation({
    onNewUrl: function(url) {
      expect(url).toEqual('http://localhost' + path);
      loc.unmount();
      done();
    }
  });

  loc.reflect(data);
});

test('unmount correctly', function(done) {
  window.history.pushState({}, '', '/');

  var firstRun = true;
  var loc = initEasyLocation({
    onChange: function() {
      if (firstRun) {
        firstRun = false;

        return;
      }
      done(new Error('callback is called'));
    },
    onNewUrl: function() {
      done(new Error('callback is called'));
    }
  });

  loc.unmount();
  window.history.pushState({}, '', '/?1');
  window.history.back();
  setTimeout(done, 10);
});
