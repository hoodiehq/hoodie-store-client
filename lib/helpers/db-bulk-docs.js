module.exports = bulkDocs

var internals = bulkDocs.internals = {}

// we wrap PouchDB’s .bulkDocs method in order to guarantee that the events get
// emmited before the Promise gets resolved. This is how the rest of Hoodie’s
// APIs behave. Also it avoids confusion that listening to events after adding
// a revision will emit an add event for the previously added document, e.g.
//
//    store.add([{_id: 'foo'}, {_id: 'bar'}]).then(function () {
//      hoodie.on('add', handler) // called with {_id: 'foo'} & {_id: 'bar'}
//    })
//
// With our workaround, the handler will not be called in the example above.
function bulkDocs (state, docs) {
  return new Promise(function (resolve, reject) {
    var scope = {
      wantedRevs: [],
      missedChangedDocs: [],
      resolve: resolve,
      result: [],
      docs: docs
    }

    scope.changeHandler = changeHandler.bind(null, state, scope)
    scope.resetHandler = resetHandler.bind(null, state, scope)
    state.emitter.on('change', scope.changeHandler)
    state.emitter.once('reset', scope.resetHandler)

    scope.bulkDocsPromise = state.db.bulkDocs(docs)

    .then(function (result) {
      if (result.length === 0) {
        state.emitter.removeListener('change', scope.changeHandler)
        state.emitter.removeListener('reset', scope.resetHandler)
        resolve([])
        return
      }

      scope.result = result
        .map(internals.toNormalisedError.bind(null, scope))
        .map(function (result, i) {
          if (!result.rev) {
            return result
          }

          docs[i]._id = result.id
          docs[i]._rev = result.rev
          return docs[i]
        })
      scope.wantedRevs = result.map(toRev).filter(Boolean)
    })

    .catch(reject)
  })
}

function toRev (result) {
  return result.rev
}

internals.toNormalisedError = function toNormalisedError (scope, result, i) {
  if (result instanceof Error) {
    if (result.status === 409) {
      var conflict = new Error('Document with id "' + scope.docs[i]._id + '" already exists')
      conflict.name = 'Conflict'
      conflict.status = 409
      return conflict
    }
  }

  return result
}

function changeHandler (state, scope, eventName, doc) {
  var index = scope.wantedRevs.indexOf(doc._rev)

  if (index === -1) {
    return
  }

  scope.wantedRevs.splice(index, 1)

  if (scope.wantedRevs.length === 0) {
    state.emitter.removeListener('change', scope.changeHandler)
    state.emitter.removeListener('reset', scope.resetHandler)
    scope.resolve(scope.result)
  }
}

function resetHandler (state, scope) {
  state.emitter.removeListener('change', scope.changeHandler)
  scope.bulkDocsPromise.then(function (result) {
    scope.resolve(scope.result)
  })
}
