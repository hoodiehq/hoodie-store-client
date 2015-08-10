module.exports = syncWrapper

var toObject = require('./utils/to-object')

function syncWrapper (method, docsOrIds) {
  return this[method](docsOrIds).then(function (syncedObjs) {
    return syncedObjs.map(toObject)
  })
}
