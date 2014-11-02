var root;

if (typeof exports !== 'undefined') {
  root = global;

  if (!root.document || !root.window) {
    var jsdom = require('jsdom').jsdom;

    root.document = jsdom('<html><head><script></script></head><body></body></html>', null, {
      FetchExternalResources   : ['script'],
      ProcessExternalResources : ['script'],
      MutationEvents           : '2.0',
      QuerySelector            : false
    });

    root.window = root.document.parentWindow;
    root.navigator = root.window.navigator;
  }

  root.Backbone = require('backbone');
  root.Backbone.$ = root.$ = require('jquery');
  root._ = require('underscore');
  root.Metal = require('backbone-metal');
  require('6to5/register');
  require('../src/dom');

  root.chai = require('chai');
  root.sinon = require('sinon');
  root.chai.use(require('sinon-chai'));

  setup();
} else {
  root = window;
  mocha.setup('bdd');
  root.onload = function() {
    mocha.checkLeaks();
    mocha.globals(['stub', 'spy']);
    mocha.run();
    setup();
  };
}

root.DOM = Backbone.DOM;
root.expect = chai.expect;

function setup() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    root.stub = this.sandbox.stub.bind(this.sandbox);
    root.spy  = this.sandbox.spy.bind(this.sandbox);
  });

  afterEach(function() {
    delete root.stub;
    delete root.spy;
    this.sandbox.restore();
  });
}
