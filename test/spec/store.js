var expect = require('chai').expect;
var sinon = require('sinon');

describe('store', function() {

  var Store = require('../../lib/store');
  var dispatcher = {
    registerStore: sinon.spy()
  };
  Store.setDispatcher(dispatcher);

  var Events = require('quincy-reactive').EventStream;

  afterEach(function() {
    dispatcher.registerStore.reset();
  });

  describe('constructor', function() {

    afterEach(function() {
      dispatcher.registerStore.reset();
    });

    it('should create a new Store instance', function() {
      var s = new Store({}, dispatcher);
      expect(s).to.be.instanceof(Store);
      expect(s.changes).to.be.instanceof(Events);
    });

    it('should call the default initialize method', function() {
      var opts = {};
      var s = new Store(opts, dispatcher);
      expect(s._options).to.deep.equal(opts);
    });

    it('should register the store with the dispatcher', function() {
      var s = new Store({}, dispatcher);
      expect(dispatcher.registerStore.calledOnce).to.be.true;
      expect(dispatcher.registerStore.getCall(0).args).to.deep.equal([s]);
    });
  });

  describe('onAction', function() {

    it('should add the action handler for the specified type', function() {
      var s = new Store({}, dispatcher);
      var f = function() {};
      s.onAction('test', f);
      expect(s.actions).to.deep.equal({test: f});
    });
    it('should return the store for chaining', function() {
      var s = new Store({}, dispatcher);
      expect(s.onAction('test', function(){})).to.equal(s);
    });

  });

  describe('createClass', function() {
    it('should return a Store class with the provided specs', function() {
      var specs = {
        displayName: 'TestStore',
        a: function() {},
        b: function() {}
      };
      var S = Store.createClass(specs);
      expect(S.prototype.a).to.equal(specs.a);
      expect(S.prototype.b).to.equal(specs.b);
      expect(new S({}, dispatcher)).to.be.instanceof(Store);

    });

  });

  describe('handleAction', function() {
    it('should call the handler for the specified action', function() {
      var s = new Store();
      var spy = sinon.spy();
      s.onAction('test', spy);
      var a = {type: 'test'};
      s.handleAction(a);
      expect(spy.called).to.be.true;
      expect(spy.getCall(0).args).to.deep.equal([a]);
    });

  });
});
