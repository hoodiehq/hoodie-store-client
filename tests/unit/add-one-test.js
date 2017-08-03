var simple = require('simple-mock')
var test = require('tape')

var addOne = require('../../lib/helpers/add-one')

test('add-one non-409 error', function (t) {
  t.plan(1)

  var non409Error = new Error('not a 409 error')

  simple.mock(addOne.internals, 'put').rejectWith(non409Error)
  simple.mock(addOne.internals, 'addTimestamps')

  var state = {
    validate: function () { return true }
  }
  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an error')
  })

  .catch(function (error) {
    t.is(error, non409Error)

    simple.restore()
  })
})
