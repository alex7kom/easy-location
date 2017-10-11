'use strict';

/* eslint-env node, mocha */
/* global window:true */
/* eslint no-new: "off" */
/* eslint no-empty-function: "off" */
/* eslint max-len: "off" */
/* eslint max-statements: "off" */

var expect = require('chai').expect;
var JSDOM = require('jsdom').JSDOM;

var initEasyLocation = require('../src');
var util = require('../src/util');

describe('EasyLocation', function () {

  describe('EasyLocation#constructor', function () {
    beforeEach(function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });

      global.window = dom.window;
    });

    it('should throw an error without options', function () {
      expect(function () {
        initEasyLocation();
      }).to.throw('options');
    });

    it('should throw an error with invalid options', function () {
      expect(function () {
        initEasyLocation(null);
      }).to.throw('options');
      expect(function () {
        initEasyLocation(1);
      }).to.throw('options');
    });

    it('should throw an error without onChange callback', function () {
      expect(function () {
        initEasyLocation({});
      }).to.throw('onChange callback');
    });

    it('should throw an error with invalid onChange callback', function () {
      expect(function () {
        initEasyLocation({ onChange: 1 });
      }).to.throw('onChange callback');
    });

    it('should call onChange callback on start', function (done) {
      initEasyLocation({
        onChange: function () {
          done();
        }
      });
    });

    it('should throw an error with invalid onNewUrl callback', function () {
      expect(function () {
        initEasyLocation({
          onChange: function () {},
          onNewUrl: 1
        });
      }).to.throw('onNewUrl callback');
    });

    it('should call onChange callback on popstate', function (done) {
      var firstRun = true;
      initEasyLocation({
        onChange: function () {
          if (firstRun) {
            firstRun = false;

            return;
          }
          done();
        }
      });

      window.history.pushState({}, '', '?1');
      window.history.back();
    });

    it('should call onNewUrl callback on popstate', function (done) {
      initEasyLocation({
        onChange: function () {},
        onNewUrl: function () {
          done();
        }
      });

      window.history.pushState({}, '', '?1');
      window.history.back();
    });
  });

  describe('EasyLocation#reflect', function () {
    it('should call onNewUrl callback if url is changed', function (done) {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      var loc = initEasyLocation({
        onChange: function () {},
        onNewUrl: function (url) {
          expect(url).to.be.eql('https://example.com/d/?e=1');
          done();
        }
      });

      loc.reflect({
        path: ['d'],
        search: { 'e': 1 }
      });
    });

    it('should not call onNewUrl callback if url is unchanged', function (done) {
      var dom = new JSDOM('', {
        url: 'https://example.com/e/?f=1'
      });
      global.window = dom.window;

      var loc = initEasyLocation({
        onChange: function () {},
        onNewUrl: function () {
          done(new Error('callback is called'));
        }
      });

      loc.reflect({
        path: ['e'],
        search: { 'f': 1 }
      });
      setTimeout(done, 0);
    });
  });

  describe('util#getPathValues', function () {
    it('should return empty array if pathname is blank', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });

      global.window = dom.window;

      expect(util.getPathValues()).to.be.eql([]);
    });

    it('should return correct array', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/english/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/%E6%97%A5%E6%9C%AC%E8%AA%9E/'
      });

      global.window = dom.window;

      expect(util.getPathValues()).to.be.eql([
        'english',
        'русский',
        '日本語'
      ]);
    });
  });

  describe('util#getSearchValues', function () {
    // more like integration test since parsing is handled by external library
    it('should return empty object if search string is blank', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });

      global.window = dom.window;

      expect(util.getSearchValues()).to.be.eql({});
    });

    it('should return correct object', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/?a=1&lang=%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9&%E6%97%A5%E6%9C%AC%E8%AA%9E=false'
      });

      global.window = dom.window;

      expect(util.getSearchValues()).to.be.eql({
        'a': '1',
        'lang': 'русский',
        '日本語': 'false'
      });
    });
  });

  describe('util#getValues', function () {
    it('should return object with empty properties if path is blank', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });

      global.window = dom.window;

      expect(util.getValues()).to.be.eql({
        path: [],
        search: {}
      });
    });

    it('should return correct object', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/a/b/c?d=1&e=2&f=3'
      });

      global.window = dom.window;

      expect(util.getValues()).to.be.eql({
        path: ['a', 'b', 'c'],
        search: {
          'd': '1',
          'e': '2',
          'f': '3'
        }
      });
    });
  });

  describe('util#preparePath', function () {
    var path = '/d/e/f/';
    var dom = new JSDOM('', {
      url: 'https://example.com' + path
    });

    beforeEach(function () {
      global.window = dom.window;
    });

    it('should return current path if path is null or undefined', function () {
      expect(util.preparePath()).to.be.eql(path);
      expect(util.preparePath(null)).to.be.eql(path);
    });

    it('should throw if path is not an array or null or undefined', function () {
      expect(function () {
        util.preparePath(1);
      }).to.throw('Invalid path');
    });

    it('should return correct path if path values are empty', function () {
      expect(util.preparePath([])).to.be.eql('/');
    });

    it('should return correct path', function () {
      expect(util.preparePath([
        'english',
        'русский',
        '日本語'
      ])).to.be.eql('/english/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/%E6%97%A5%E6%9C%AC%E8%AA%9E/');
    });
  });

  describe('util#prepareSearch', function () {

    it('should return current search string if value is null or undefined', function () {
      var search = '?a=1&b=2&c=3';
      var dom = new JSDOM('', {
        url: 'https://example.com/' + search
      });
      global.window = dom.window;

      expect(util.prepareSearch()).to.be.eql(search);
      expect(util.prepareSearch(null)).to.be.eql(search);
    });

    it('should return empty string if current search and values are empty', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      expect(util.prepareSearch({})).to.be.eql('');
    });

    it('should throw if search is not an object or null or undefined', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      expect(function () {
        util.prepareSearch(1);
      }).to.throw('Invalid search');
    });

    it('should return correct search string', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      expect(util.prepareSearch({
        'x': 1,
        'y': 2,
        'z': 3
      })).to.be.eql('?x=1&y=2&z=3');
    });

    it('should preserve current values', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/?a=0&d=8&f=7&s=9'
      });
      global.window = dom.window;

      expect(util.prepareSearch({
        'x': 1,
        'y': 2,
        'z': 3
      })).to.be.eql('?a=0&d=8&f=7&s=9&x=1&y=2&z=3');
    });

    it('should unset values for which `undefined` is supplied', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/?a=0&d=8&f=7&s=9'
      });
      global.window = dom.window;

      expect(util.prepareSearch({
        'd': undefined /* eslint no-undefined: "off" */
      })).to.be.eql('?a=0&f=7&s=9');
    });
  });

  describe('util#prepareUrl', function () {
    it('should return correct full path', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com'
      });
      global.window = dom.window;

      expect(util.prepareUrl({
        path: ['q', 'w', 'e'],
        search: {
          'x': 1,
          'y': 2,
          'z': 3
        }
      })).to.be.eql('/q/w/e/?x=1&y=2&z=3');
    });

    it('should return correct full path with empty data', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/q/w/e/?x=1&y=2&z=3'
      });
      global.window = dom.window;

      expect(util.prepareUrl({})).to.be.eql('/q/w/e/?x=1&y=2&z=3');
      expect(util.prepareUrl({
        path: []
      })).to.be.eql('/?x=1&y=2&z=3');
      expect(util.prepareUrl({
        search: {}
      })).to.be.eql('/q/w/e/?x=1&y=2&z=3');
    });

    it('should throw if argument is not an object', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      expect(function () {
        util.prepareUrl(1);
      }).to.throw('data');
    });
  });

  describe('util#getCurrentUrl', function () {
    it('should return current path with get params', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/q/w/e/?x=1&y=2&z=3'
      });
      global.window = dom.window;

      expect(util.getCurrentUrl()).to.be.eql('/q/w/e/?x=1&y=2&z=3');
    });

    it('should return current path with get params if no path', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/?x=1&y=2&z=3'
      });
      global.window = dom.window;

      expect(util.getCurrentUrl()).to.be.eql('/?x=1&y=2&z=3');
    });

    it('should return current path with get params if no get params', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/q/w/e/'
      });
      global.window = dom.window;

      expect(util.getCurrentUrl()).to.be.eql('/q/w/e/');
    });
  });

  describe('util#setUrl', function () {
    it('should correctly push state to history', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      util.setUrl('/q/w/e/');
      expect(window.location.href).to.be.eql('https://example.com/q/w/e/');
    });

    it('should correctly push state to history and preserve hash', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/#test'
      });
      global.window = dom.window;

      util.setUrl('/q/w/e/');
      expect(window.location.href).to.be.eql('https://example.com/q/w/e/#test');
    });
  });

  describe('util#reflect', function () {
    it('should not set url if path and get params are not changed', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/a/?b=1'
      });
      global.window = dom.window;

      expect(util.reflect({
        path: ['a'],
        search: { 'b': 1 }
      })).to.be.eql(false);
    });

    it('should set url correctly', function () {
      var dom = new JSDOM('', {
        url: 'https://example.com/'
      });
      global.window = dom.window;

      expect(util.reflect({
        path: ['b'],
        search: { 'c': 1 }
      })).to.be.eql(true);
      expect(window.location.href).to.be.eql('https://example.com/b/?c=1');
    });
  });

});
