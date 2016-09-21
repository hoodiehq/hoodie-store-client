module.exports = {
  isTypeError: function (objects, type) {
    if (Array.isArray(objects)) {
      return objects.some(function (object) { object.type && object.type !== type })
    }

    return typeof objects === 'object' && objects.type && objects.type !== type
  },

  createErrorMessage: function (type) {
    return 'type field in document does not match scoped store type of \'' + type + '\''
  }
}
