'use strict';

var decodeUriComponent = require('decode-uri-component');
var objectAssign = require('object-assign');
var strictUriEncode = require('strict-uri-encode');
var qs = require('query-string');

var loc = window.location;

function getPathValues() {
  return loc.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeUriComponent);
}

function getSearchValues() {
  return qs.parse(loc.search);
}

function getValues() {
  return {
    path: getPathValues(),
    search: getSearchValues()
  };
}

function preparePath(pathValues) {
  if (pathValues == null) {
    return loc.pathname;
  }

  return (
    '/' +
    pathValues
      .map(function(part) {
        return strictUriEncode(part) + '/';
      })
      .join('')
  );
}

function prepareSearch(searchValues) {
  if (searchValues == null || Object.keys(searchValues).length === 0) {
    return loc.search;
  }

  var values = objectAssign({}, getSearchValues(), searchValues);

  return '?' + qs.stringify(values);
}

function prepareUrl(data) {
  return preparePath(data.path) + prepareSearch(data.search);
}

function getCurrentUrl() {
  return loc.pathname + loc.search;
}

function setUrl(url) {
  window.history.pushState({}, '', url + loc.hash);
}

function reflect(data) {
  var url = prepareUrl(data);

  if (url === getCurrentUrl()) {
    return false;
  }

  setUrl(url);

  return true;
}

module.exports = {
  getValues: getValues,
  reflect: reflect
};
