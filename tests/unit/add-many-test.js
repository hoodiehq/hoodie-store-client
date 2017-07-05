var simple = require('simple-mock')
var test = require('tape')

var addMany = require('../../lib/helpers/add-many')

test('add-many non-409 error', function (t) {
  t.plan(1)

  var non409Error = new Error('not a 409 error')
  var state = {
    db: {
      bulkDocs: simple.stub().resolveWith([non409Error])
    }
  }

  addMany(state, [])

  .then(function (responses) {
    t.is(responses[0], non409Error)
  })
})
