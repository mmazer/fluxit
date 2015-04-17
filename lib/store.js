var QN = require('quincy');
var Events = require('quincy-reactive').EventStream;

var _dispatcher;

function register(store) {
  store._dispatcher.registerStore(store);
}

function actionIter(handler, action) {
  this.actions[action] = handler;
}

function Store(options, dispatcher) {
  this._dispatcher = dispatcher || _dispatcher;
  this.changes = new Events();
  this.initialize(options);
  register(this);
}

Store.prototype.initialize = function(options) {
  this._options = options || {};
};

Store.prototype.onAction = function(action, handler) {
  if (!this.actions) this.actions = {};

  if (QN.isObject(action)) {
    QN.forEach(actionIter, action, this);
  } else {
    this.actions[action] = handler;
  }

  return this;
};

Store.prototype.sendChange = function(type) {
  this.changes.emit(type || 'change');
};

Store.prototype.forEach = function(handler, context) {
  return this.changes.forEach(handler, context);
};

Store.prototype.handleAction = function(action) {
  if (!this.actions) return;

  var type = action.type || 'action';
  var handler = this.actions[type];
  if (QN.isString(handler)) handler = this[handler];

  if (handler) handler.call(this, action);
};

Store.createClass = function(spec) {
  return QN.createClass(Store, spec);
};

Store.setDispatcher = function(dispatcher) {
  _dispatcher = dispatcher;
};

module.exports = Store;
