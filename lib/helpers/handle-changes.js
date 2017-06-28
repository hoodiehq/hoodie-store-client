module.exports = handleChanges

function handleChanges (state) {
  var isBootstrapping = true
  var changesDuringBootstrapping = []
  var knownDocIds = {}

  // we have to initially load all documents in order to differentiate add from
  // change events by populating knownDocIds. This is something we wish would be
  // simpler but unfortunately we can’t expose the necessery information with
  // pouchDB directly, see https://github.com/pouchdb/pouchdb/pull/6553
  state.bootstrap = state.db.allDocs()

  .then(function (result) {
    isBootstrapping = false

    result.rows.forEach(function (row) {
      knownDocIds[row.id] = 1
    })

    changesDuringBootstrapping.forEach(handleChange)
  })

  // we listen to the changes feed which we use to emit our own events
  // if there happen to be events while we are still populating knownDocIds
  // then we store the events in changesDuringBootstrapping which are handled
  // once the initial bootstrap is done
  state.db.changes({
    since: 'now',
    live: true,
    include_docs: true
  })
  .on('change', function (change) {
    if (isBootstrapping) {
      changesDuringBootstrapping.push(change)
      return
    }

    handleChange(change)
  })

  function handleChange (change) {
    var doc = change.doc

    if (!doc.hoodie) {
      doc.hoodie = {}
    }

    if (change.deleted) {
      // ignore deletes for unknown docs
      if (!knownDocIds[change.id]) {
        return
      }

      delete knownDocIds[change.id]
      state.emitter.emit('remove', doc)
      state.emitter.emit('change', 'remove', doc)
      return
    }

    if (knownDocIds[change.id]) {
      state.emitter.emit('update', doc)
      state.emitter.emit('change', 'update', doc)
      return
    }

    knownDocIds[change.id] = 1
    state.emitter.emit('add', doc)
    state.emitter.emit('change', 'add', doc)
  }
}
