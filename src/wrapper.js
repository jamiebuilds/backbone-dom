(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore', 'backbone-metal'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('backbone'), require('underscore'), require('backbone-metal'));
  } else {
    factory(root.Backbone, root._, root.Backbone.Metal);
  }
})(this, function(Backbone, _, Metal) {
  'use strict';

  var _slice = Array.prototype.slice;

  // @include ./dom.js
  return DOM;
});
