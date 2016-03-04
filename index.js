module.exports = Hoodie

var getState = require('./lib/get-state')
var getApi = require('./lib/get-api')
var init = require('./lib/init')

function Hoodie (options) {
  var state = getState(options)
  var api = getApi(state)
  init(api)
  return api
}
