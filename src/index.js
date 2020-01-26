'use strict';

var util = require('./util');

function initEasyLocation(_opts) {
  var opts = _opts || {};

  function callOnChange() {
    if (opts.onChange) {
      opts.onChange(util.getValues());
    }
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
    },
    unmount: function() {
      window.removeEventListener('popstate', callOnChange);
      window.removeEventListener('popstate', callOnNewUrl);
    }
  };
}

module.exports = initEasyLocation;
