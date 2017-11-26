var markAsDeleted = require('./utils/mark-as-deleted')

var updateOne = require('./helpers/update-one')
var updateMany = require('./helpers/update-many')

module.exports = remove

/**
 * removes existing object
 *
 * @param  {String}          prefix         optional id prefix
 * @param  {Object|Function} objectsOrIds   id or object with `._id` property
 * @param  {Object|Function} [change]       Change properties or function that
 *                                          changes existing object
 * @return {Promise}
 */
function remove (state, prefix, objectsOrIds, change) {
  if (Array.isArray(objectsOrIds)) {
    return Promise.all(objectsOrIds.map(markAsDeleted.bind(null, state, change)))

    .then(function (docs) {
      return updateMany(state, docs, null, prefix)
    })
  }

  return markAsDeleted(state, change, objectsOrIds)

  .then(function (doc) {
    return updateOne(state, doc, null, prefix)
  })
}
