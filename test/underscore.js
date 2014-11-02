describe('Underscore mixins', function() {
  describe('#isView', function() {
    beforeEach(function() {
      this.MyView = DOM.View.extend().extend();
      this.MyCtor = function() {};
    });

    it('should return true for views', function() {
      expect(_.isView(this.MyView))
        .to.be.true;
    });

    it('should return true for Backbone.Views', function() {
      expect(_.isView(new Backbone.View))
        .to.be.true;
    });

    it('should return true for instances of View', function() {
      expect(_.isView(new this.MyView()))
        .to.be.true;
    });

    it('should return false for normal constructors', function() {
      expect(_.isView(this.MyCtor))
        .to.be.false;
    });

    it('should return false for other values', function() {
      _.each([true, false, undefined, null, 0, 'hi'], function(val) {
        expect(_.isView(val))
          .to.be.false;
      });
    });
  });
});
