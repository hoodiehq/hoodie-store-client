module.exports = function pluginMethod (plugin) {
  var self = this

  if (typeof plugin === 'function') {
    plugin(self)
  }

  if (typeof plugin === 'object') {
    Object.keys(plugin).forEach(function (key) {
      self[key] = plugin[key]
    })
  }

  return self
}
