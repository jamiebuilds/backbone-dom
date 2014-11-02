describe('utils', function() {
  describe('#parentNode', function() {
    beforeEach(function() {
      this.parent = document.createElement('div');
      this.child = document.createElement('div');
      this.parent.appendChild(this.child);
    });

    it('should return a the parent node', function() {
      expect(DOM.utils.parentNode(this.child))
        .to.equal(this.parent);
    });

    it('should return null when there is no parent node', function() {
      expect(DOM.utils.parentNode(this.parent))
        .to.be.null;
    });
  });

  describe('#nextSibling', function() {
    beforeEach(function() {
      this.parent = document.createElement('div');
      this.child1 = document.createElement('div');
      this.child2 = document.createElement('div');
      this.parent.appendChild(this.child1);
      this.parent.appendChild(this.child2);
    });

    it('should return the next sibling', function() {
      expect(DOM.utils.nextSibling(this.child1))
        .to.equal(this.child2);
    });

    it('should return null when there is no next sibling', function() {
      expect(DOM.utils.nextSibling(this.child2))
        .to.be.null;
    });
  });

  describe('#insertBefore', function() {
    beforeEach(function() {
      this.parent = document.createElement('div');
      this.child1 = document.createElement('div');
      this.child2 = document.createElement('div');
      this.parent.appendChild(this.child1);
    });

    it('should insert the node into the parent node before the next sibling', function() {
      expect(DOM.utils.insertBefore(this.parent, this.child2, this.child1))
        .to.equal(this.child2);
      expect(this.parent.firstChild)
        .to.equal(this.child2);
    });
  });

  describe('#appendChild', function() {
    beforeEach(function() {
      this.parent = document.createElement('div');
      this.child1 = document.createElement('div');
      this.child2 = document.createElement('div');
      this.parent.appendChild(this.child1);
    });

    it('should append the node into the parent node', function() {
      expect(DOM.utils.appendChild(this.parent, this.child2))
        .to.equal(this.child2);
      expect(this.parent.lastChild)
        .to.equal(this.child2);
    });
  });

  describe('#innerHTML', function() {
    beforeEach(function() {
      this.parent = document.createElement('div');
      this.parent.innerHTML = 'foo';
    });

    it('should get the innerHTML when no html is passed', function() {
      expect(DOM.utils.innerHTML(this.parent))
        .to.equal('foo');
    });

    it('should set the innerHTML when html is passed', function() {
      expect(DOM.utils.innerHTML(this.parent, 'bar'))
        .to.equal('bar');
      expect(this.parent.innerHTML)
        .to.equal('bar');
    });
  });

  describe('#remove', function() {
    beforeEach(function() {
      this.parent = document.createElement('div');
      this.child = document.createElement('div');
      this.parent.appendChild(this.child);
    });

    it('should remove the node from the dom', function() {
      expect(DOM.utils.remove(this.child))
        .to.be.undefined;
    });
  });
});
