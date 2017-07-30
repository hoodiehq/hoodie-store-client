module.exports = put

// we wrap PouchDB’s .put method in order to guarantee that the events get
// emmited before the Promise gets resolved. This is how the rest of Hoodie’s
// APIs behave. Also it avoids confusion that listening to events after adding
// a revision will emit an add event for the previously added document, e.g.
//
//    store.add({_id: 'foo'}).then(function () {
//      hoodie.on('add', handler) // called with {_id: 'foo'}
//    })
//
// With our workaround, the handler will not be called in the example above.
function put (state, doc) {
  return new Promise(function (resolve, reject) {
    var scope = {
      wantedRev: null,
      missedChangedDocs: [],
      resolve: resolve
    }

    scope.changeHandler = changeHandler.bind(null, state, scope)
    scope.resetHandler = resetHandler.bind(null, state, scope)
    state.emitter.on('change', scope.changeHandler)
    state.emitter.once('reset', scope.resetHandler)

    scope.putPromise = state.db.put(doc)

    .then(function (result) {
      doc._id = result.id
      doc._rev = result.rev
      scope.result = doc
      scope.wantedRev = result.rev
      scope.missedChangedDocs.forEach(scope.changeHandler.bind(null, state, scope, null))
    })

    .catch(reject)
  })
}

function changeHandler (state, scope, _notUsedEventName, doc) {
  if (!scope.wantedRev) {
    scope.missedChangedDocs.push(doc._rev)
    return
  }

  if (doc._rev === scope.wantedRev) {
    state.emitter.removeListener('change', scope.changeHandler)
    state.emitter.removeListener('reset', scope.resetHandler)
    scope.resolve(scope.result)
  }
}

function resetHandler (state, scope) {
  state.emitter.removeListener('change', scope.changeHandler)
  scope.putPromise.then(function (result) {
    scope.resolve(scope.result)
  })
}
