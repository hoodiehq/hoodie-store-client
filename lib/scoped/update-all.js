module.exports = updateAll

var findAll = require('./find-all')
var update = require('./update')

function updateAll (type, api, changedProperties) {
  return findAll(type, api)

  .then(function (foundObjects) {
    return update(type, api, foundObjects, changedProperties)
  })
}
