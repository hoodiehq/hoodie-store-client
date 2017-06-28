var simple = require('simple-mock')
var test = require('tape').test

var handleChanges = require('../../lib/helpers/handle-changes')

test('handleChanges changes during bootstrapping', function (t) {
  t.plan(2)

  var change = {
    doc: {
      foo: 'bar'
    },
    id: 'id1234'
  }

  var resolveAllDocs
  var promise = new Promise(function (resolve) {
    resolveAllDocs = resolve
  })
  var state = {
    db: { },
    emitter: {
      emit: simple.spy()
    }
  }
  state.db.allDocs = function () { return promise }
  simple.mock(state.db, 'changes').returnWith({
    on: simple.spy().callFn(function (changeEvent, callback) {
      callback(change)
    })
  })

  handleChanges(state)

  Promise.resolve(resolveAllDocs({ rows: [] }))

  .then(function () {
    t.is(state.emitter.emit.callCount, 2, 'add and change/add event called')
    t.deepEqual(
      state.emitter.emit.lastCall.args,
      ['change', 'add', change.doc],
      'change event was called with change.doc'
    )
  })
})
