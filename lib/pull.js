module.exports = pull

var Promise = require('lie')

var toId = require('./utils/to-id')

/**
 * pulls one or multiple objects from remote to local database
 *
 * @param  {StringOrObject} docsOrIds   object or ID of object or array of objects/ids (all optional)
 * @return {Promise}
 */
function pull (state, docsOrIds) {
  var pulledObjects = []
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

      var replication = state.db.replicate.from(remote, {
        doc_ids: docsOrIds
      })

      /* istanbul ignore next */
      replication.catch(function () {
        // handled trough 'error' event
      })

      replication.on('complete', function () {
        resolve(pulledObjects)
      })
      replication.on('error', reject)

      replication.on('change', function (change) {
        pulledObjects = pulledObjects.concat(change.docs)
        for (var i = 0; i < change.docs.length; i++) {
          state.emitter.emit('pull', change.docs[i])
        }
      })
    })
  })
}
