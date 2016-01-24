module.exports = Hoodie

var Store = require('hoodie-client-store')
var Account = require('hoodie-client-account')
var ConnectionStatus = require('hoodie-client-connection-status')
var Log = require('hoodie-client-log')

var getState = require('./lib/get-state')

function Hoodie (options) {
  var state = getState(options)

  var api = {
    get url () {
      return state.url + '/hoodie'
    }
  }

  var account = new Account({ url: api.url + '/account/api' })

  var CustomStore = Store.defaults({
    remoteBaseUrl: api.url + '/store/api'
  })
  var dbName = 'user/' + account.id
  var store = new CustomStore(dbName, {
    ajax: function () {
      var session = api.account.get('session')
      if (!session) {
        return
      }

      return {
        headers: {
          authorization: 'Bearer ' + session.id
        }
      }
    }
  })

  // core modules
  api.account = account
  api.store = store
  api.request = require('./lib/request').bind(this, state)
  api.connectionStatus = new ConnectionStatus(api.url)
  api.log = new Log('hoodie')
  api.plugin = require('./lib/plugin')

  // events
  api.on = require('./lib/events').on.bind(this, state)
  api.one = require('./lib/events').one.bind(this, state)
  api.off = require('./lib/events').off.bind(this, state)
  api.trigger = require('./lib/events').trigger.bind(this, state)

  // glue code
  account.on('signout', function () {
    // TODO: prevent data loss on sign out:
    //       https://github.com/hoodiehq/hoodie-client/issues/22
    store.clear()
  })

  account.on('signin', function () {
    store.reset().then(
      store.connect
    )
  })

  return api
}
