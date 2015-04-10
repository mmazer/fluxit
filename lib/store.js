var QN = require('quincy');
var Events = require('quincy-reactive').EventStream;

var _dispatcher;

function register(store) {
  store._dispatcher.registerStore(store);
}

function actionIter(handler, type) {
  this.onAction(type, handler);
}

function Store(options, dispatcher) {
  this._dispatcher = dispatcher || _dispatcher;
  this.changes = new Events();
  this._actions = {};
  this.initialize(options);
  register(this);
}

Store.prototype.initialize = function(options) {
  this._options = options || {};

  if (!options) return;
  QN.forEach(actionIter, options.actions, this);
};

Store.prototype.onAction = function(type, handler) {
  if (!QN.isFunction(handler)) handler = this[handler];

  if (!QN.isFunction(handler)) {
    throw new TypeError('function required for action handler');
  }

  this._actions[type] = handler;

  return this;
};

Store.prototype.sendChange = function(type) {
  this.changes.emit(type || 'change');
};

Store.prototype.forEach = function(handler, context) {
  return this.changes.forEach(handler, context);
};

Store.prototype.handleAction = function(action) {
  var type = action.type || 'action';
  var handler = this._actions[type];

  if (handler) handler.call(this, action);
};

Store.createClass = function(spec) {
  return QN.createClass(Store, spec);
};

Store.setDispatcher = function(dispatcher) {
  if (_dispatcher) throw new Error('store dispatcher already configured');
  else _dispatcher = dispatcher;
};

module.exports = Store;
