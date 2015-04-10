var QN = require('quincy');

var _dispatcher;

function Action(dispatcher) {
  this.dispatcher = dispatcher || _dispatcher;
}

Action.prototype.dispatchAction = function(type, data) {
  this.dispatch({
    type: type,
    data: data
  });
};

Action.prototype.dispatchError = function(type, cause) {
  this.dispatch({
    type: type,
    error: true,
    cause: cause
  });
};

Action.prototype.dispatch = function(action) {
  this.dispatcher.dispatch(action);
};

function createAction(fn, dispatcher) {
  if (!QN.isFunction(fn)) throw new TypeError('function required for action');

  return fn.bind(new Action(dispatcher));
}

function actionIter(actions, fn, name) {
  actions[name] = createAction(fn, this.dispatcher);
  return actions;
}

Action.setDispatcher = function(dispatcher) {
  if (_dispatcher) throw new Error('action dispatcher already configured');
  else _dispatcher = dispatcher;
};

module.exports = {
  Action: Action,
  create: function(action, dispatcher) {
    if (QN.isObject(action)) {
      return QN.fold(actionIter, {}, action, {dispatcher: dispatcher});
    } else {
      return createAction(action, dispatcher);
    }
  }
};
