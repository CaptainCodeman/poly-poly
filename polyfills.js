// Load webcomponentsjs polyfill if browser does not support native Web Components
// Load additional polyfills required by the app on an as-needed basis from polyfill.io
(function (w,d) {
  'use strict';

  var wcr = function () {
    // For native Imports, manually fire WebComponentsReady so user code
    // can use the same code path for native and polyfill'd imports.
    if (!w.HTMLImports) {
      d.dispatchEvent(new CustomEvent('WebComponentsReady', { bubbles: true }));
    }
  };

  var webComponentsSupported = ('registerElement' in d && 'import' in d.createElement('link') && 'content' in d.createElement('template'));
  if (!webComponentsSupported) {
    var s = d.createElement('script');
    s.async = true;
    s.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
    s.onload = wcr;
    d.head.appendChild(s);
  } else {
    wcr();
  }

  // Adapted from https://polyfill.io/v2/docs/examples (see: Feature Detection)

  var polyfilled = function() {
    w.PolyfillCallbacks = w.PolyfillCallbacks || [];
    for(var i = 0; i < w.PolyfillCallbacks.length; i++) {
      w.PolyfillCallbacks[i]();
    }
    w.PolyfillCallbacks.push = function() {
      arguments[0]();
    }
  }

  // Create list of the features this browser needs to be polyfilled
  var features = [];
  ('IntersectionObserver' in w) || features.push('IntersectionObserver');

  if (features.length) {
    var s = d.createElement('script');

    // Include a `ua` argument set to a supported browser to skip UA identification
    // (improves response time) and avoid being treated as unknown UA (which would
    // otherwise result in no polyfills, even with `always`, if UA is unknown)
    s.async = true;
    s.src = 'https://polyfill.io/v2/polyfill.min.js?features=' + features.join(',') + '&flags=gated,always&ua=chrome/50';
    s.onload = polyfilled;
    d.head.appendChild(s);
  } else {
    polyfilled();
  }

})(window,document);
