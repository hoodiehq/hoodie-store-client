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
    },
    get url () {
      return state.url + '/hoodie'
    }
  }

  var CustomStore = Store.defaults({ remoteBaseUrl: api.url + '/store/api' })
  var dbName = 'user/' + api.id
  api.store = new CustomStore(dbName)

  api.account = new Account({ url: api.url + '/account/api' })
  api.task = new Task('/hoodie/task/api')
  api.request = require('./lib/request').bind(this, state)
  api.connectionStatus = new ConnectionStatus(api.url)
  api.log = new Log('hoodie')
  api.plugin = require('./lib/plugin')

  api.on = require('./lib/events').on.bind(this, state)
  api.one = require('./lib/events').one.bind(this, state)
  api.off = require('./lib/events').off.bind(this, state)
  api.trigger = require('./lib/events').trigger.bind(this, state)

  return api
}
