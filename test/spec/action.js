var expect = require('chai').expect;
var sinon = require('sinon');

describe('action', function() {

  var api = require('../../lib/action');

  describe('create', function() {
    it('should return a function', function() {
      var action = api.create(function() {});
      expect(action).to.be.a('function');
    });

    it('should accept a map of action keys', function() {
      var actions = api.create({
        a: function() {},
        b: function() {}
      });
      expect(actions).to.be.defined;
      expect(actions.a).to.be.a('function');
      expect(actions.b).to.be.a('function');

    });

    it('should return a function that applies its arguments to the action function', function() {

      var spy = sinon.spy();
      var action = api.create(spy);
      action(1,2,3);
      expect(spy.getCall(0).calledWith(1, 2, 3)).to.be.true;

    });

    it('should return a function that uses the specifed dispatcher', function() {

      var spy = sinon.spy();
      var action = api.create(function() {
        this.dispatchAction('test', 'test.data');
       }, {dispatch: spy});
      action();
      expect(spy.getCall(0).args[0]).to.deep.equal({type: 'test', data: 'test.data'});

    });
  });

  describe('dispatch', function() {

     it('should call the dispatcher with the action payload', function() {

      var spy = sinon.spy();
      var action = api.create(function() {
        this.dispatch({type: 'test', data: 'test.data'});
      }, {dispatch: spy});
      action();
      expect(spy.getCall(0).args[0]).to.deep.equal({type: 'test', data: 'test.data'});
    });
 });

  describe('dispatchAction', function() {

     it('should call the dispatcher with the action type and data', function() {

      var spy = sinon.spy();
      var action = api.create(function() {
        this.dispatchAction('test', 'test.data');
      }, {dispatch: spy});
      action();
      expect(spy.getCall(0).args[0]).to.deep.equal({type: 'test', data: 'test.data'});
    });
 });

  describe('dispatchError', function() {

     it('should call the dispatcher with the action type and cause', function() {

      var spy = sinon.spy();
      var action = api.create(function() {
        this.dispatchError('test', 'error');
      }, {dispatch: spy});
      action();
      expect(spy.getCall(0).args[0]).to.deep.equal({type: 'test', error: true, cause: 'error'});
    });
 });

 describe('setDispatcher', function() {
  it('should set the default action dispatcher', function() {
    var d = {};
    api.setDispatcher(d);
  });

 });

});
