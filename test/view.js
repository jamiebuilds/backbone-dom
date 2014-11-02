describe('View', function() {
  it('should be subclassed properly', function() {
    expect(new DOM.View())
      .to.be.instanceOf(Backbone.Metal.Class)
      .to.be.instanceOf(Backbone.View);
  });

  describe('#compile', function() {
    it('should return undefined when no template is defined', function() {
      var view = new DOM.View();
      expect(view.compile())
        .to.be.undefined;
    });

    it('should compile a template with data if defined', function() {
      var view = new DOM.View();
      view.template = stub().returns('foo');
      view.serializeData = stub().returns({ bar: 'baz' });

      expect(view.compile())
        .to.equal('foo');
      expect(view.serializeData)
        .to.have.been.calledOnce
        .and.calledOn(view);
      expect(view.template)
        .to.have.been.calledOnce
        .and.calledOn(view)
        .and.calledWith({ bar: 'baz' });
    });
  });

  describe('#render', function() {
    beforeEach(function() {
      this.parentNode = document.createElement('div');
      this.nextSibling = document.createElement('div');
      this.parentNode.appendChild(this.nextSibling);
      this.template = stub().returns('foo');
      this.view = new DOM.View({
        template: this.template
      });
      spy(this.view, 'compile');
      spy(this.view, 'detach');
      spy(this.view, 'attach');
      spy(this.view, 'triggerMethod');
    });

    it('should render the view', function() {
      expect(this.view.render().el.innerHTML)
        .to.equal('foo');
    });

    it('should detach and reattach the view', function() {
      this.view.attach(this.parentNode);
      this.view.render();
      expect(this.view.detach)
        .to.have.been.calledOn(this.view);
      expect(this.view.attach)
        .to.have.been.calledOn(this.view);
      expect(this.view.detach)
        .to.have.been.calledBefore(this.view.attach);
    });

    it('should attach the view to the same place it was detached', function() {
      this.view.attach(this.parentNode, this.nextSibling);
      this.view.render();
      expect(this.view.attach)
        .to.have.been.calledWith(this.parentNode, this.nextSibling);
    });

    it('should not render the view twice if it doesnt change', function() {
      this.view.attach(this.parentNode);
      this.view.attach.reset();
      this.view.render();
      this.view.render();
      expect(this.view.compile)
        .to.have.been.calledTwice;
      expect(this.view.detach)
        .to.have.been.calledOnce;
      expect(this.view.attach)
        .to.have.been.calledOnce;
    });

    it('should fire "before:render" before rendering', function() {
      this.view.on('before:render', function() {
        expect(this.view.el.innerHTML)
          .to.equal('');
      }, this);
      this.view.render();
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('before:render');
    });

    it('should fire "render" after rendering', function() {
      this.view.on('render', function() {
        expect(this.view.el.innerHTML)
          .to.equal('foo');
      }, this);
      this.view.render();
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('render');
    });

    it('should throw an error when trying to render a destroyed view', function() {
      var self = this;
      this.view.destroy();
      expect(function() {
        self.view.render();
      }).to.throw(DOM.Error, 'Views cannot be rendered after they have been destroyed.');
    });

    it('should return this', function() {
      expect(this.view.render()).to.equal(this.view);
    });
  });

  describe('#attach', function() {
    beforeEach(function() {
      this.parentNode = document.createElement('div');
      this.nextSibling = document.createElement('div');
      this.view = new DOM.View();
      spy(this.view, 'triggerMethod');
    });

    it('should attach a view to a parent node', function() {
      this.view.attach(this.parentNode);
      expect(this.parentNode.firstChild)
        .to.equal(this.view.el);
    });

    it('should attach a view to a parent node before a sibling', function() {
      this.parentNode.appendChild(this.nextSibling);
      this.view.attach(this.parentNode, this.nextSibling);
      expect(this.parentNode.firstChild)
        .to.equal(this.view.el);
      expect(this.nextSibling.previousSibling)
        .to.equal(this.view.el);
    });

    it('should not attempt to attach a view twice', function() {
      this.view.attach(this.parentNode);
      this.view.triggerMethod.reset();
      this.view.attach(this.parentNode);
      expect(this.view.triggerMethod)
        .not.to.have.calledWith('attach');
    });

    it('should fire "before:attach" before attaching', function() {
      this.view.on('before:attach', function() {
        expect(this.parentNode.firstChild)
          .not.to.equal(this.view.el);
        expect(this.view.isAttached())
          .to.be.false;
      }, this);
      this.view.attach(this.parentNode);
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('before:attach');
    });

    it('should fire "attach" after attaching', function() {
      this.view.on('attach', function() {
        expect(this.parentNode.firstChild)
          .to.equal(this.view.el);
        expect(this.view.isAttached())
          .to.be.true;
      }, this);
      this.view.attach(this.parentNode);
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('attach');
    });

    it('should throw an error when trying to attach a destroyed view', function() {
      var self = this;
      this.view.destroy();
      expect(function() {
        self.view.attach(self.parentNode);
      }).to.throw(DOM.Error, 'Views cannot be attached after they have been destroyed.');
    });

    it('should return this', function() {
      expect(this.view.attach(this.parentNode)).to.equal(this.view);
    });
  });

  describe('#detach', function() {
    beforeEach(function() {
      this.parentNode = document.createElement('div');
      this.view = new DOM.View();
      this.view.attach(this.parentNode);
      spy(this.view, 'triggerMethod');
    });

    it('should detach a view', function() {
      this.view.detach();
      expect(this.parentNode.firstChild)
        .not.to.equal(this.view.el);
    });

    it('should not attempt to detach a view twice', function() {
      this.view.detach();
      this.view.triggerMethod.reset();
      this.view.detach();
      expect(this.view.triggerMethod)
        .not.to.have.calledWith('detach');
    });

    it('should fire "before:detach" before detaching', function() {
      this.view.on('before:detach', function() {
        expect(this.parentNode.firstChild)
          .to.equal(this.view.el);
        expect(this.view.isAttached())
          .to.be.true;
      }, this);
      this.view.detach();
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('before:detach');
    });

    it('should fire "detach" after detaching', function() {
      this.view.on('detach', function() {
        expect(this.parentNode.firstChild)
          .not.to.equal(this.view.el);
        expect(this.view.isAttached())
          .to.be.false;
      }, this);
      this.view.detach();
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('detach');
    });

    it('should throw an error when trying to detach a destroyed view', function() {
      var self = this;
      this.view.destroy();
      expect(function() {
        self.view.detach();
      }).to.throw(DOM.Error, 'Views cannot be detached after they have been destroyed.');
    });

    it('should return this', function() {
      expect(this.view.detach()).to.equal(this.view);
    });
  });

  describe('#destroy', function() {
    beforeEach(function() {
      this.parentNode = document.createElement('div');
      this.template = stub().returns('foo');
      this.view = new DOM.View({
        template: this.template
      });
      spy(this.view, 'detach');
      spy(this.view, 'triggerMethod');
      this.view.attach(this.parentNode);
      this.view.render();
    });

    it('should detach the view', function() {
      this.view.destroy();
      expect(this.view.detach)
        .to.have.been.called;
    });

    it('should empty the views html', function() {
      // This can only be tested by spying on utils.innerHTML because view.el
      // is deleted as part of destroy.
      spy(DOM.utils, 'innerHTML');
      var el = this.view.el;
      this.view.destroy();
      expect(DOM.utils.innerHTML)
        .to.have.been.calledWith(el, '');
    });

    it('should fire "before:destroy" before detaching', function() {
      var el = this.view.el;
      this.view.on('before:destroy', function() {
        expect(this.parentNode.firstChild)
          .to.equal(el);
        expect(this.view.isDestroyed())
          .to.be.false;
        expect(this.view.isRendered())
          .to.be.true;
        expect(this.view.isAttached())
          .to.be.true;
      }, this);
      this.view.destroy();
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('before:destroy');
    });

    it('should fire "destroy" after detaching', function() {
      var el = this.view.el;
      this.view.on('destroy', function() {
        expect(this.parentNode.firstChild)
          .not.to.equal(el);
        expect(this.view.isDestroyed())
          .to.be.true;
        expect(this.view.isRendered())
          .to.be.false;
        expect(this.view.isAttached())
          .to.be.false;
      }, this);
      this.view.destroy();
      expect(this.view.triggerMethod)
        .to.have.been.calledWith('destroy');
    });

    it('should throw an error when trying to destroy an already destroyed view', function() {
      var self = this;
      this.view.destroy();
      expect(function() {
        self.view.destroy();
      }).to.throw(DOM.Error, 'Views cannot be destroyed more than once.');
    });

    it('should return this', function() {
      expect(this.view.destroy()).to.equal(this.view);
    });
  });

  describe('#serializeData', function() {
    beforeEach(function() {
      this.data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      this.collection = new Backbone.Collection(this.data);
      this.model = new Backbone.Model(this.data[0]);
      this.view = new DOM.View();
      spy(this.view, 'serializeModel');
      spy(this.view, 'serializeCollection');
    });

    it('should call serializeModel for views with a model', function() {
      this.view.model = this.model;
      this.view.serializeData();
      expect(this.view.serializeModel)
        .to.have.been.calledOn(this.view)
        .and.calledWith(this.model);
    });

    it('should call serializeCollection for views with a collection', function() {
      this.view.collection = this.collection;
      this.view.serializeData();
      expect(this.view.serializeCollection)
        .to.have.been.calledOn(this.view)
        .and.calledWith(this.collection);
    });
  });

  describe('#serializeModel', function() {
    beforeEach(function() {
      this.data = { id: 1 };
      this.model = new Backbone.Model(this.data);
      this.view = new DOM.View();
    });

    it('should serialize the collection', function() {
      expect(this.view.serializeModel(this.model))
        .to.deep.equal(this.data);
    });

    it('should be returning a clone of the data', function() {
      expect(this.view.serializeModel(this.model))
        .not.to.equal(this.data);
    });
  });

  describe('#serializeCollection', function() {
    beforeEach(function() {
      this.data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      this.collection = new Backbone.Collection(this.data);
      this.view = new DOM.View();
      spy(this.view, 'serializeModel');
    });

    it('should serialize the collection', function() {
      expect(this.view.serializeCollection(this.collection))
        .to.deep.equal({
          items: this.data
        });
    });

    it('should be returning a clone of the data', function() {
      expect(this.view.serializeCollection(this.collection).items)
        .not.to.equal(this.data);
    });

    it('should be calling serializeModel for each model', function() {
      this.view.serializeCollection(this.collection)
      expect(this.view.serializeModel)
        .to.have.been.calledOn(this.view)
        .and.calledWith(this.collection.models[0])
        .and.calledWith(this.collection.models[1])
        .and.calledWith(this.collection.models[2]);
    });
  });

  describe('#isRendered', function() {
    beforeEach(function() {
      this.dom = document.createElement('div');
      this.view = new DOM.View();
    });

    it('should return false before view is rendered', function() {
      expect(this.view.isRendered())
        .to.be.false;
    });

    it('should return true after the view is rendered', function() {
      expect(this.view.render().isRendered())
        .to.be.true;
    });

    it('should return false after the view is destroyed', function() {
      expect(this.view.render().destroy().isRendered())
        .to.be.false;
    });
  });

  describe('#isDestroyed', function() {
    beforeEach(function() {
      this.dom = document.createElement('div');
      this.view = new DOM.View();
    });

    it('should return false before view is destroyed', function() {
      expect(this.view.isDestroyed())
        .to.be.false;
    });

    it('should return true after the view is destroyed', function() {
      expect(this.view.destroy().isDestroyed())
        .to.be.true;
    });
  });

  describe('#isAttached', function() {
    beforeEach(function() {
      this.dom = document.createElement('div');
      this.view = new DOM.View();
    });

    it('should return false before view is attached', function() {
      expect(this.view.isAttached())
        .to.be.false;
    });

    it('should return true after the view is attached', function() {
      expect(this.view.attach(this.dom).isAttached())
        .to.be.true;
    });

    it('should return false after the view is detached', function() {
      expect(this.view.attach(this.dom).detach().isAttached())
        .to.be.false;
    });
  });
});
