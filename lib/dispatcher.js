var forEach = require('quincy').forEach;
var Events = require('quincy-reactive').EventStream;

function preDispatch(store, name) {
  this._pending[name] = false;
  this._completed[name] = false;
}

function dispatchAction(store, name) {
  if (this._pending[name]) return;

  callHandler.call(this, store, name);
}

function callHandler(store, name) {
  this._pending[name] = true;

  try {
    store.handleAction.call(store, this._action);
    this._completed[name] = true;
  } catch (e) {
    if (!this._errors) this._errors = {};
    this._errors[name] = e;
  }
}

function waitForStore(store) {
  if (this._pending[store]) {
    if (!this._completed[store]) {
      throw new Error('circular dependency detected waiting for store: ' + store);
    }

    return forEach.BREAK;
  }

  if (!(store in this._stores)) throw new Error('waitFor store not registered: ' + store);
  callHandler.call(this, this._stores[store], store);
}

function Dispatcher(events) {
  this.events = events || new Events();
  this._stores = {};
}

Dispatcher.prototype.dispatch = function(action) {
  if (this._isDispatching) throw new Error('cannot dispatch while another dispatch is in progress');

  this._isDispatching = true;
  this._pending = {};
  this._completed = {};
  this._errors = null;
  this._action = action;

  forEach(preDispatch, this._stores, this);
  forEach(dispatchAction, this._stores, this);
  this.events.emit(action);

  this._isDispatching = false;
  this._pending = null;
  this._completed = null;
  this._action = null;
};

Dispatcher.prototype.forEach = function(handler, thisArg) {
  return this.events.forEach(handler, thisArg);
};

Dispatcher.prototype.errors = function() {
  return this._errors;
};

Dispatcher.prototype.registerStore = function(store, name) {
  if (!name) name = store.displayName;
  if (!name) throw new TypeError('store name required');
  if (name in this._stores) throw new TypeError('store already registered: ' + name);

  this._stores[name] = store;
};

Dispatcher.prototype.unregisterStore = function(name) {
  delete this._stores[name];
};

Dispatcher.prototype.waitFor = function(stores) {
  if (!this._isDispatching) {
    throw new Error('waitFor must be called during dispatch');
  }

  forEach(waitForStore, stores, this);
};

module.exports = Dispatcher;
