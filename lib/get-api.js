
module.exports = getApi

var defaultsDeep = require('lodash/defaultsDeep')

var internals = module.exports.internals = {}
internals.Store = require('@hoodie/store-client')
internals.Account = require('@hoodie/account-client')
internals.ConnectionStatus = require('@hoodie/connection-status/client')
internals.Log = require('@hoodie/log/client')

function getApi (state) {
  var api = {
    get url () {
      return state.url + '/hoodie'
    }
  }

  var account = mergeOptionsAndCreate(internals.Account, { url: api.url + '/account/api' }, state.account)

  var CustomStore = internals.Store.defaults({
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
          authorization: 'Session ' + session.id
        }
      }
    }
  })

  // core modules
  api.account = account
  api.store = store
  api.request = require('./request').bind(this, state)
  api.connectionStatus = mergeOptionsAndCreate(internals.ConnectionStatus, { url: api.url }, state.connectionStatus)
  api.log = mergeOptionsAndCreate(internals.Log, { prefix: 'hoodie' }, state.log)
  api.plugin = require('./plugin')

  // events
  api.on = require('./events').on.bind(this, state)
  api.one = require('./events').one.bind(this, state)
  api.off = require('./events').off.bind(this, state)
  api.trigger = require('./events').trigger.bind(this, state)
  return api
}

function mergeOptionsAndCreate (objectConstructor, defaultOptions, stateOptions) {
  var options = defaultsDeep(defaultOptions, stateOptions || {})
  return objectConstructor(options)
}
