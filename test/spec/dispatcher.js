var expect = require('chai').expect;
var sinon = require('sinon');

describe('dispatcher', function() {

  var Dispatcher = require('../../lib/dispatcher');
  var Events = require('quincy-reactive').EventStream;

  describe('constructor', function() {

    it('should return a new Dispatcher instance', function() {
      var dispatcher = new Dispatcher();
      expect(dispatcher).to.be.instanceof(Dispatcher);
      expect(dispatcher.events).to.be.instanceof(Events);
    });
  });

  describe('dispatch', function() {
    var dispatcher;

    beforeEach(function() {
      dispatcher = new Dispatcher();
    });

    it('should dispatch the action', function() {
      var spy = sinon.spy();
      dispatcher.events.forEach(spy);
      dispatcher.dispatch({type: 'action.type', data: 'action.data'});
      expect(spy.getCall(0).args[0]).to.deep.equal({
          type: 'action.type',
          data: 'action.data'
      });
      expect(dispatcher.errors()).to.be.null;
    });

    it('should catch errors thrown by handlers', function() {
      var err = new Error('handleActionError');

      dispatcher.registerStore({
          displayName: 'TestStore',
          handleAction: function() {
            throw err;
          }
      });
      dispatcher.dispatch('action');
      expect(dispatcher.errors()).to.deep.equal({
          TestStore: err
      });
    });

    it('should emit an action event', function() {
      dispatcher.registerStore({
          displayName: 'TestStore',
          handleAction: function() {
          }
      });
      var spy = sinon.spy();
      var a = { type: 'test'};
      dispatcher.forEach(spy);
      dispatcher.dispatch(a);
      expect(spy.getCall(0).args[0]).to.deep.equal({
          type: 'test'
      });
    });

    it('should emit an action event after store handler errors', function() {
      dispatcher.registerStore({
          displayName: 'TestStore',
          handleAction: function() {
            throw new Error();
          }
      });
      var spy = sinon.spy();
      var a = { type: 'test'};
      dispatcher.forEach(spy);
      dispatcher.dispatch(a);
      expect(spy.getCall(0).args[0]).to.deep.equal({
          type: 'test'
      });
    });

  });

  describe('waitFor', function() {
    var dispatcher;

    beforeEach(function() {
      dispatcher = new Dispatcher();
    });

    it('should call the store handler for the specified stores', function() {

      var s1 = { displayName: 'store1', handleAction: sinon.spy()};
      dispatcher.registerStore(s1);

      var spy = sinon.spy();
      dispatcher.registerStore({ handleAction: function(action) {
          dispatcher.waitFor(['store1']);
          spy(action);
      }}, 'store2');
      var action = {type: 'test'};
      dispatcher.dispatch(action);

      expect(s1.handleAction.callCount).to.equal(1);
      expect(s1.handleAction.getCall(0).args[0]).to.deep.equal(action);
      expect(spy.callCount).to.equal(1);
      expect(spy.getCall(0).args[0]).to.deep.equal(action);
    });

    it('should detect circular dependencies', function() {
      var spy1 = sinon.spy();
      var spy2 = sinon.spy();
      var s1 = {
        displayName: 'store1',
        handleAction: function(action) {
          dispatcher.waitFor(['store2']);
          spy1(action);
      }};
      var s2 = {
        displayName: 'store2',
        handleAction: function(action) {
          dispatcher.waitFor(['store1']);
          spy2(action);
      }};
      dispatcher.registerStore(s1);
      dispatcher.registerStore(s2);
      dispatcher.dispatch('action');
      expect(dispatcher.errors()).to.deep.equal({
          store2: new Error('circular dependency detected waiting for store: store1')
      });
      expect(spy1.called).to.be.true;
      expect(spy2.called).to.be.false;
    });

    it('should detect a store waiting for itself', function() {
      var spy = sinon.spy();
      var s = {
        displayName: 'store1',
        handleAction: function(action) {
          dispatcher.waitFor(['store1']);
          spy(action);
      }};
      dispatcher.registerStore(s);
      dispatcher.dispatch('action');
      expect(dispatcher.errors()).to.deep.equal({
          store1: new Error('circular dependency detected waiting for store: store1')
      });
      expect(spy.called).to.be.false;
    });

  });
});
