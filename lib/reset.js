module.exports = reset

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./subscribe-to-sync-events')

function reset (dbName, CustomPouchDB, state, api, clear, emitter, remoteBaseUrl, remote, options) {
  if (options) {
    if (options.name) {
      dbName = options.name
    }

    if (options.remote) {
      remote = options.remote
    } else if (options.name && remoteBaseUrl) {
      remote = remoteBaseUrl + '/' + encodeURIComponent(options.name)
    }

    CustomPouchDB = CustomPouchDB.defaults(options)
  }

  return api.disconnect()

  .then(clear)

  .then(function () {
    var newDB = new CustomPouchDB(dbName)
    var syncApi = newDB.hoodieSync({remote: remote})
    var storeApi = newDB.hoodieApi({emitter: emitter})

    subscribeToSyncEvents(syncApi, emitter)

    merge(
      api,
      {
        db: storeApi.db,
        add: storeApi.add,
        find: storeApi.find,
        findAll: storeApi.findAll,
        findOrAdd: storeApi.findOrAdd,
        update: storeApi.update,
        updateOrAdd: storeApi.updateOrAdd,
        updateAll: storeApi.updateAll,
        remove: storeApi.remove,
        removeAll: storeApi.removeAll,
        on: storeApi.on,
        one: storeApi.one,
        off: storeApi.off,
        withIdPrefix: storeApi.withIdPrefix
      },
      {
        push: syncApi.push,
        pull: syncApi.pull,
        sync: syncApi.sync,
        connect: syncApi.connect,
        disconnect: syncApi.disconnect,
        isConnected: syncApi.isConnected
      }
    )

    api.reset = reset.bind(null, dbName, CustomPouchDB, state, api, storeApi.clear, emitter, remoteBaseUrl, remote)
  })
}
