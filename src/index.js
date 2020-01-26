'use strict';

var util = require('./util');

function initEasyLocation(opts) {
  /* eslint max-statements: "off" */
  if (typeof opts !== 'object' || opts === null) {
    throw new TypeError('No valid options provided');
  }

  if (typeof opts.onChange !== 'function') {
    throw new TypeError('onChange callback is not a function');
  }

  if (opts.onNewUrl && typeof opts.onNewUrl !== 'function') {
    throw new TypeError('onNewUrl callback is not a function');
  }

  function callOnChange() {
    opts.onChange(util.getValues());
  }

  function callOnNewUrl() {
    if (opts.onNewUrl) {
      opts.onNewUrl(window.location.href);
    }
  }

  window.addEventListener('popstate', callOnChange);
  window.addEventListener('popstate', callOnNewUrl);

  // Initial call before anything else can reflect on URL
  callOnChange();

  return {
    reflect: function(data) {
      if (util.reflect(data)) {
        callOnNewUrl();
      }
    }
  };
}

module.exports = initEasyLocation;
