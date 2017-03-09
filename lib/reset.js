module.exports = reset

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./subscribe-to-sync-events')

function reset (dbName, options, state, api, clear, emitter) {
  return api.disconnect()

  .then(clear)

  .then(function () {
    var newDB = new options.PouchDB(dbName)
    var syncApi = newDB.hoodieSync(options)
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

    api.reset = reset.bind(null, dbName, options, state, api, storeApi.clear, emitter)
  })
}
