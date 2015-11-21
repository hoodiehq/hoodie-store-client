module.exports = Hoodie

var Store = require('hoodie-client-store')
var Account = require('hoodie-client-account')
var Task = function () {}
var ConnectionStatus = require('hoodie-client-connection-status')
var Log = require('hoodie-client-log')

var getState = require('./lib/get-state')
var id = require('./lib/id')

function Hoodie (options) {
  var state = getState(options)

  var api = {
    get id () {
      return id.get(state)
    }
  }

  var CustomStore = Store.defaults({ remoteBaseUrl: '/hoodie/store/api' })
  var dbName = 'user/' + api.id
  api.store = new CustomStore(dbName)

  api.account = new Account({ url: '/hoodie/account/api' })
  api.task = new Task('/hoodie/task/api')
  api.connectionStatus = new ConnectionStatus('/hoodie')
  api.log = new Log('hoodie')

  api.on = require('./lib/events').on.bind(this, state)
  api.one = require('./lib/events').one.bind(this, state)
  api.off = require('./lib/events').off.bind(this, state)
  api.trigger = require('./lib/events').trigger.bind(this, state)

  return api
}
