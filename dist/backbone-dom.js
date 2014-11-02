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

  /**
   * @module DOM
   */
  var DOM = Backbone.DOM = {};
  
  /**
   * A subclass of Metal.Error for use in Backbone Views.
   *
   * @example
   * throw new DOM.Error('Why must I cry?');
   * // >> ViewError: Why must I cry?
   * // >>   [stack trace]
   *
   * @class Error
   * @memberOf DOM
   * @extends Metal.Error
   */
  var Err = DOM.Error = Metal.Error.extend({
    name: 'ViewError',
    urlRoot: 'http://github.com/thejameskyle/backbone-dom'
  });
  
  /**
   * These are provided as a place to override DOM's usage of native methods with
   * your own methods.
   *
   * @name utils
   * @memberOf DOM
   */
  var utils = DOM.utils = {
  
    /**
     * Get the parent node of an element.
     *
     * @public
     * @method parentNode
     * @memberOf DOM.utils
     * @param {Node} node - The element to look up the parent from.
     * @return {Node} - The parent node.
     */
    parentNode: function(node) {
      return node.parentNode;
    },
  
    /**
     * Get the next sibling node of an element.
     *
     * @example
     * document.body;
     * // >> <body><div></div><span></span></body>
     *
     * document.body.children[0]
     * // >> <div></div>
     *
     * utils.nextSibling(document.body.children[0]);
     * // >> <span></span>
     *
     * @public
     * @method nextSibling
     * @memberOf DOM.utils
     * @param {Node} node - The element to look up the next sibling from.
     * @return {Node} - The next sibling.
     */
    nextSibling: function(node) {
      return node.nextSibling;
    },
  
    /**
     * Insert an element inside a parent node before a next sibling node.
     *
     * @example
     * document.body;
     * // >> <body><span></span></body>
     *
     * utils.insertBefore(document.body, document.createElement('div'), document.body.children[0]);
     * // >> <div></div>
     *
     * document.body;
     * // >> <body><div></div><span></span></body>
     *
     * @public
     * @method insertBefore
     * @memberOf DOM.utils
     * @param {Node} parentNode - The node to insert inside.
     * @param {Node} node - The node to insert.
     * @param {Node} nextSibling - The node to insert before.
     * @return {Node} - The inserted node.
     */
    insertBefore: function(parentNode, node, nextSibling) {
      return parentNode.insertBefore(node, nextSibling);
    },
  
    /**
     * Append a node to a parent node.
     *
     * @example
     * utils.appendChild(document.body, document.createElement('div'));
     * // >> <div></div>
     *
     * document.body;
     * // <body><div></div></body>
     *
     * @public
     * @method appendChild
     * @memberOf DOM.utils
     * @param {Node} parentNode - The node to append inside.
     * @param {Node} node - The node to append.
     * @return {Node} - The appended node.
     */
    appendChild: function(parentNode, node) {
      return parentNode.appendChild(node);
    },
  
    /**
     * Get or set the innerHTML of a DOM element.
     *
     * If you specify `html` it will be used as a setter, otherwise it will be
     * used as a getter.
     *
     * @example
     * utils.innerHTML(document.body);
     * // >> ''
     *
     * utils.innerHTML(document.body, 'Hello World!');
     * // >> 'Hello World!'
     *
     * utils.innerHTML(document.body);
     * // >> 'Hello World!'
     *
     * @public
     * @method innerHTML
     * @memberOf DOM.utils
     * @param {Node} node - The node to get/set inner html.
     * @param {String} [html] - The html to set the node's inner html to.
     * @return {String} - The inner html of the node.
     */
    innerHTML: function(node, html) {
      if (html) {
        return (node.innerHTML = html);
      } else {
        return node.innerHTML;
      }
    },
  
    /**
     * Remove an element from the DOM.
     *
     * @example
     * document.body;
     * // >> <body><div></div></body>
     *
     * utils.remove(document.body.children[0]);
     *
     * document.body;
     * // >> <body></body>
     *
     * @public
     * @method remove
     * @memberOf DOM.utils
     * @param {Node} node - The node to remove.
     */
    remove: function(node) {
      if (node.remove) {
        node.remove();
      } else {
        var parentNode = utils.parentNode(node);
        parentNode.removeChild(node);
      }
    }
  };
  
  /**
   * Creates a new View.
   *
   * @example
   * var MyView = View.extend({
   *   template: _.template('Hello <%= location %>!'),
   *   initialize() {
   *     console.log(this.$el.html());
   *   }
   * });
   *
   * new MyView({
   *   model: new Backbone.Model({ location: 'World' })
   * });
   * // >> Hello World!
   *
   * @public
   * @class View
   * @memberOf DOM
   */
  var View = DOM.View = Backbone.View.extend({
  
    constructor: function(options) {
      if (options === undefined)
        options = {};

      if (options.template) {
        this.template = options.template;
      }
      this._super.apply(this, arguments);
    },
  
    /**
     * Compile the template with data.
     *
     * @public
     * @instance
     * @abstact
     * @method compile
     * @memberOf DOM.View
     * @return {String} - The compiled template.
     */
    compile: function() {
      if (!this.template) {
        return;
      }
  
      // Get data for template.
      var data = this.serializeData();
  
      // Compile template.
      return this.template(data);
    },
  
    /**
     * Render template with data, or update existing DOM.
     *
     * @public
     * @instance
     * @method render
     * @memberOf DOM.View
     * @fires DOM.View#before:render
     * @fires DOM.View#render
     * @throws {ViewError} - cannot call this method on a destroyed view.
     * @return {Object} - this
     */
    render: function() {
      // Immediately throw an error if attempting to render a view that has been
      // destroyed.
      if (this._isDestroyed) {
        throw new Err('Views cannot be rendered after they have been destroyed.');
      }
  
      /**
       * @event DOM.View#before:render
       */
      this.triggerMethod('before:render');
  
      var html = this.compile();
  
      // Avoid re-rendering when it will result in the same html.
      if (html === utils.innerHTML(this.el)) {
        return this;
      }
  
      // Store current position so it can be re-attached to the same location.
      var parentNode = utils.parentNode(this.el);
      var nextSibling = utils.nextSibling(this.el);
  
      // Detach only when view is currently in DOM.
      if (parentNode && this._isAttached) {
        this.detach();
      }
  
      // Insert new DOM.
      utils.innerHTML(this.el, html);
  
      // Attach only when it was previously in the DOM.
      if (parentNode && !this._isAttached) {
        this.attach(parentNode, nextSibling);
      }
  
      // Mark the view as rendered.
      this._isRendered = true;
  
      /**
       * @event DOM.View#render
       */
      this.triggerMethod('render');
  
      return this;
    },
  
    /**
     * Add `el` to a particular location in DOM.
     *
     * @public
     * @instance
     * @method attach
     * @memberOf DOM.View
     * @param {Element} parentNode
     * @param {Element} [nextSibling]
     * @fires DOM.View#before:attach
     * @fires DOM.View#attach
     * @throws {ViewError} - cannot call this method on a destroyed view.
     * @return {Object} - this
     */
    attach: function(parentNode, nextSibling) {
      // Immediately throw an error if attempting to attach a view that has been
      // destroyed.
      if (this._isDestroyed) {
        throw new Err('Views cannot be attached after they have been destroyed.');
      }
  
      /**
       * @event DOM.View#before:attach
       */
      this.triggerMethod('before:attach');
  
      // Don't attach if view is already attached.
      if (this._isAttached) {
        return this;
      }
  
      // If there is a next sibling node, insert it before that sibling,
      // otherwise append it to the parent node.
      if (nextSibling) {
        utils.insertBefore(parentNode, this.el, nextSibling);
      } else {
        utils.appendChild(parentNode, this.el);
      }
  
      // Mark the view as attached.
      this._isAttached = true;
  
      /**
       * @event DOM.View#attach
       */
      this.triggerMethod('attach');
  
      return this;
    },
  
    /**
     * Remove `el` from DOM.
     *
     * @public
     * @instance
     * @method detach
     * @memberOf DOM.View
     * @fires DOM.View#before:detach
     * @fires DOM.View#detach
     * @throws {ViewError} - cannot call this method on a destroyed view.
     * @return {Object} - this
     */
    detach: function() {
      // Immediately throw an error if attempting to detach a view that has been
      // destroyed.
      if (this._isDestroyed) {
        throw new Err('Views cannot be detached after they have been destroyed.');
      }
  
      /**
       * @event DOM.View#before:attach
       */
      this.triggerMethod('before:detach');
  
      // Don't detach if view is not attached.
      if (!this._isAttached) {
        return this;
      }
  
      // Remove the element from the DOM.
      utils.remove(this.el);
  
      // Mark the view as detached
      this._isAttached = false;
  
      /**
       * @event DOM.View#detach
       */
      this.triggerMethod('detach');
  
      return this;
    },
  
    /**
     * Permanently destroy a View preventing it from ever getting rendered again.
     *
     * @public
     * @instance
     * @method destroy
     * @memberOf DOM.View
     * @throws {ViewError} - cannot call this method on an already destroyed view.
     * @return {Object} - this
     */
    destroy: function() {
      // Immediately throw an error if the view has already been destroyed
      if (this._isDestroyed) {
        throw new Err('Views cannot be destroyed more than once.');
      }
  
      /**
       * @event DOM.View#before:destroy
       */
      this.triggerMethod('before:destroy');
  
      // Remove the view from the DOM.
      this.detach(this.el);
  
      // Ensure the view is empty.
      utils.innerHTML(this.el, '');
  
      // Remove any event listeners.
      this.stopListening();
  
      // Attempt to remove DOM nodes from the instance.
      delete this.el;
      delete this.$el;
  
      // Mark the view as not rendered.
      this._isRendered = false;
  
      // Mark the view as destroyed.
      this._isDestroyed = true;
  
      /**
       * @event DOM.View#destroy
       */
      this.triggerMethod('destroy');
  
      return this;
    },
  
    /**
     * Serialize the model or collection.
     *
     * @public
     * @instance
     * @abstact
     * @method serializeData
     * @memberOf DOM.View
     * @return {Object} - The serialized data.
     */
    serializeData: function() {
      if (this.model) {
        return this.serializeModel(this.model);
      } else if (this.collection) {
        return this.serializeCollection(this.collection);
      }
    },
  
    /**
     * Serialize a model.
     *
     * @public
     * @instance
     * @abstact
     * @method serializeModel
     * @memberOf DOM.View
     * @param {Model} model - The model to serialize.
     * @return {Object} - The serialized model.
     */
    serializeModel: function(model) {
      return _.clone(model.attributes);
    },
  
    /**
     * Serialize a collection.
     *
     * @public
     * @instance
     * @abstact
     * @method serializeCollection
     * @memberOf DOM.View
     * @param {Collection} collection - The collection to serialize.
     * @return {Array} - The serialized collection.
     */
    serializeCollection: function(collection) {
      return {
        items: _.map(collection.models, this.serializeModel, this)
      };
    },
  
    /**
     * Checks if view is rendered.
     *
     * @public
     * @instance
     * @method isRendered
     * @memberOf DOM.View
     * @return {Boolean} - `true` if the view is rendered, else `false`.
     */
    isRendered: function() {
      return this._isRendered === true;
    },
  
    /**
     * Checks if view is destroyed.
     *
     * @public
     * @instance
     * @method isDestroyed
     * @memberOf DOM.View
     * @return {Boolean} - `true` if the view is destroyed, else `false`.
     */
    isDestroyed: function() {
      return this._isDestroyed === true;
    },
  
    /**
     * Checks if view is attached.
     *
     * @public
     * @instance
     * @method isAttached
     * @memberOf DOM.View
     * @return {Boolean} - `true` if the view is attached, else `false`.
     */
    isAttached: function() {
      return this._isAttached === true;
    }
  });
  
  _.mixin({
  
    /**
     * Checks if `value` is a DOM View.
     *
     * ```js
     * _.isView(View.extend(...));
     * // >> true
     * _.isView(new View());
     * // >> true
     * _.isView(function() {...});
     * // >> false
     * _.isView({...});
     * // >> false
     * ```
     *
     * @public
     * @method isClass
     * @memberOf _
     * @param {*} value - The value to check.
     * @return {Boolean} - `true` if the `value` is a view, else `false`.
     */
    isView: function(value) {
      return !!value && (value instanceof Backbone.View || value.prototype instanceof Backbone.View);
    }
  });
  
  return DOM;
});

//# sourceMappingURL=backbone-dom.js.map