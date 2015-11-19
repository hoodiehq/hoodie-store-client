module.exports = Hoodie

var Store = require('hoodie-client-store')
var Account = require('hoodie-client-account')
var Task = function () {}
var ConnectionStatus = require('hoodie-client-connection-status')
var Log = require('hoodie-client-log')

var getState = require('./lib/get-state')
var id = require('./lib/id').id

function Hoodie (options) {
  var state = getState(options)

  var api = {}
  api.id = id.bind(null, state)

  var CustomStore = Store.defaults({ remoteBaseUrl: '/hoodie/store/api' })
  var dbName = 'user/' + api.id()
  api.store = new CustomStore(dbName)

  api.account = new Account({ url: '/hoodie/account/api' })
  api.task = new Task('/hoodie/task/api')
  api.connectionStatus = new ConnectionStatus('/hoodie')
  api.log = new Log('hoodie')

  return api
}
