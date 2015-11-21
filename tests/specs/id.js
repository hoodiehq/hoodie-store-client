var test = require('tape')
var Hoodie = require('../../index')

test('has "id" method', function (t) {
  var firstHoodie = new Hoodie()
  var secondHoodie = new Hoodie()
  t.is(typeof firstHoodie.id, 'string', 'has id getter property')
  t.is(typeof secondHoodie.id, 'string', 'has id getter property')
  t.is(firstHoodie.id, secondHoodie.id, 'id persists upon multiple instantiations')

  t.end()
})
