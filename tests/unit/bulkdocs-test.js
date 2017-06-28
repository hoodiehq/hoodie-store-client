var test = require('tape').test

var bulkDocs = require('../../lib/helpers/db-bulk-docs')

test('toNormalisedError non-409 error', function (t) {
  var scope = {} // scope is not checked in this test, so it can be empty
  var non409Error = new Error('not a 409 error')

  var error = bulkDocs.internals.toNormalisedError(scope, non409Error, 0)

  t.is(error, non409Error, 'a non-409 error is returned untouched')

  t.end()
})
