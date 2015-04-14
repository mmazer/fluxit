var QN = require('quincy');

function fold(acc, constant) {
  acc[constant] = constant;

  return acc;
}

module.exports = function(constants) {
  return QN.fold(fold, {}, constants);
};
