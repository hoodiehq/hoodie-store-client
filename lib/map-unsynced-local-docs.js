module.exports = mapUnsyncedLocalDocs

function mapUnsyncedLocalDocs (state, filter) {
  var keys

  if (filter) {
    keys = Array.isArray(filter) ? filter : [filter]
    keys = keys.map(toId)
  }

  return this.unsyncedLocalDocs.call(this, {
    remote: state.remote,
    keys: keys
  })

  .then(function (changedDocs) {
    return changedDocs.map(toDoc)
  })
}

function toId (objectOrId) {
  return objectOrId.id || objectOrId
}

function toDoc (object) {
  object.id = object._id
  delete object._id

  return object
}
