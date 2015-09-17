module.exports = add

var addType = require('../utils/add-type')

function add (type, api, objects) {
  if (Array.isArray(objects)) {
    objects = objects.map(addType.bind(null, type))
  } else {
    objects.type = type
  }

  return api.add(objects)
}
