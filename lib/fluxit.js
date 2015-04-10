var Dispatcher = require('./dispatcher');
var Store = require('./store');
var Action = require('./action');
var assign = require('quincy').assign;

var _initialized = false;
var _opts = {};

var defaults = {
  dispatcher: new Dispatcher()
};

module.exports = {
  Dispatcher: Dispatcher,
  Store: Store,
  Action: Action,
  initialize: function(options) {
    if (_initialized) throw new Error('Fluxit already initialized');

    _initialized = true;
    _opts = assign(_opts, defaults, options);

    if (_opts.dispatcher) {
      Store.setDispatcher(_opts.dispatcher);
      Action.setDispatcher(_opts.dispatcher);
    }
  },
  getDispatcher: function() {
    return _opts.dispatcher;
  }
};
