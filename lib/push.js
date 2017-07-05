module.exports = push

var Promise = require('lie')

var toId = require('./utils/to-id')

/**
 * pushes one or multiple objects from local to remote database
 *
 * @param  {StringOrObject} docsOrIds   object or ID of object or array of objects/ids (all optional)
 * @return {Promise}
 */

function push (state, docsOrIds) {
  var pushedObjects = []
  var errors = state.db.constructor.Errors

  return Promise.resolve(state.remote)

  .then(function (remote) {
    return new Promise(function (resolve, reject) {
      if (Array.isArray(docsOrIds)) {
        docsOrIds = docsOrIds.map(toId)
      } else {
        docsOrIds = docsOrIds && [toId(docsOrIds)]
      }

      if (docsOrIds && docsOrIds.filter(Boolean).length !== docsOrIds.length) {
        return Promise.reject(errors.NOT_AN_OBJECT)
      }

      var replication = state.db.replicate.to(remote, {
        create_target: true,
        doc_ids: docsOrIds,
        include_docs: true
      })

      /* istanbul ignore next */
      replication.catch(function () {
        // handled trough 'error' event
      })

      replication.on('complete', function () {
        resolve(pushedObjects)
      })
      replication.on('error', reject)
      replication.on('change', function (change) {
        pushedObjects = pushedObjects.concat(change.docs)

        for (var i = 0; i < change.docs.length; i++) {
          state.emitter.emit('push', change.docs[i])
        }
      })
    })
  })
}
