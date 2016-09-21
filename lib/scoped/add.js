module.exports = add

var addType = require('../utils/add-type')
var checkType = require('../utils/check-scoped-type')

function add (type, api, objects) {
  if (checkType.isTypeError(objects, type)) {
    return Promise.reject(new TypeError(checkType.createErrorMessage(type)))
  }

  if (Array.isArray(objects)) {
    objects = objects.map(addType.bind(null, type))
  } else {
    objects.type = type
  }

  return api.add(objects)
}
