'use strict';

var decodeUriComponent = require('decode-uri-component');
var objectAssign = require('object-assign');
var strictUriEncode = require('strict-uri-encode');
var qs = require('query-string');

var util = {};

util.getPathValues = function getPathValues() {
  return window.location.pathname
    .split('/')
    .filter(function(chunk) {
      return chunk !== '';
    })
    .map(decodeUriComponent);
};

util.getSearchValues = function getSearchValues() {
  return qs.parse(window.location.search);
};

util.getValues = function getValues() {
  return {
    path: util.getPathValues(),
    search: util.getSearchValues()
  };
};

util.preparePath = function preparePath(pathValues) {
  if (pathValues == null) {
    return window.location.pathname;
  }

  return (
    '/' +
    pathValues
      .map(function(part) {
        return strictUriEncode(part) + '/';
      })
      .join('')
  );
};

util.prepareSearch = function prepareSearch(searchValues) {
  if (searchValues == null || Object.keys(searchValues).length === 0) {
    return window.location.search;
  }

  var values = objectAssign({}, util.getSearchValues(), searchValues);

  return '?' + qs.stringify(values);
};

util.prepareUrl = function prepareUrl(data) {
  return util.preparePath(data.path) + util.prepareSearch(data.search);
};

util.getCurrentUrl = function getCurrentUrl() {
  return window.location.pathname + window.location.search;
};

util.setUrl = function setUrl(url) {
  window.history.pushState({}, '', url + window.location.hash);
};

util.reflect = function reflect(data) {
  var url = util.prepareUrl(data);

  if (url === util.getCurrentUrl()) {
    return false;
  }

  util.setUrl(url);

  return true;
};

module.exports = util;
