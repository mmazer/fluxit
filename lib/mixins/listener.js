var QN = require('quincy');

function listenTo(events, handler) {
  this.listenTo(events, this[handler]);
}

function dispose(listener) {
  listener.dispose();
}

module.exports = {
  componentWillMount: function() {
    this.listeners = [];
  },
  componentDidMount: function() {
    QN.forEach(listenTo, this.props.events, this);
  },
  componentWillUnmount: function() {
    QN.forEach(dispose, this.listeners);
    this.listeners = null;
  },
  addListener: function(listener) {
    this.listeners.push(listener);
  },
  listenTo: function(events, handler, context) {
    this.addListener(events.forEach(handler, context));
  }
};
