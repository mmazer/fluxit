var expect = require('chai').expect;

describe('enums', function() {

  var enums = require('../../lib/enums');

  it('should return a map of enums', function() {
    expect(enums([
      'AA',
      'BB',
      'CC'
    ])).to.deep.equal({
      AA: 'AA',
      BB: 'BB',
      CC: 'CC'
    });
  });

});
