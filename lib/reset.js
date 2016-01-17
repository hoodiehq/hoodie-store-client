module.exports = reset

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./subscribe-to-sync-events')
var syncWrapper = require('./sync-wrapper')
var scoped = require('./scoped/')

function reset (dbName, CustomPouchDB, state, api, emitter, remote, ajaxOptions, PouchDB, options) {
  if (options) {
    if (options.name) {
      dbName = options.name
    }

    if (options.remote) {
      remote = options.remote
    }

    CustomPouchDB = PouchDB.defaults(options)
  }

  return api.clear()

  .then(function () {
    var newDB = new CustomPouchDB(dbName)
    var syncApi = newDB.hoodieSync({remote: remote, ajax: ajaxOptions})
    var storeApi = newDB.hoodieApi({emitter: emitter})

    subscribeToSyncEvents(syncApi, emitter)

    return merge(
      api,
      scoped.bind(null, state, storeApi),
      storeApi,
      {
        push: syncWrapper.bind(syncApi, 'push'),
        pull: syncWrapper.bind(syncApi, 'pull'),
        sync: syncWrapper.bind(syncApi, 'sync'),
        connect: syncApi.connect,
        disconnect: syncApi.disconnect,
        isConnected: syncApi.isConnected
      }
    )
  })
}
