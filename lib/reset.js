module.exports = reset

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./subscribe-to-sync-events')
var syncWrapper = require('./sync-wrapper')
var scoped = require('./scoped/')

function reset (dbName, CustomPouchDB, state, api, clear, emitter, remoteBaseUrl, remote, ajaxOptions, PouchDB, options) {
  if (options) {
    if (options.name) {
      dbName = options.name
    }

    if (options.remote) {
      remote = options.remote
    } else if (options.name && remoteBaseUrl) {
      remote = remoteBaseUrl + '/' + encodeURIComponent(options.name)
    }

    CustomPouchDB = PouchDB.defaults(options)
  }

  return api.disconnect()

  .then(clear)

  .then(function () {
    var newDB = new CustomPouchDB(dbName)
    var syncApi = newDB.hoodieSync({remote: remote, ajax: ajaxOptions})
    var storeApi = newDB.hoodieApi({emitter: emitter})

    subscribeToSyncEvents(syncApi, emitter)

    merge(
      api,
      scoped.bind(null, state, storeApi),
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
        off: storeApi.off
      },
      {
        push: syncWrapper.bind(syncApi, 'push'),
        pull: syncWrapper.bind(syncApi, 'pull'),
        sync: syncWrapper.bind(syncApi, 'sync'),
        connect: syncApi.connect,
        disconnect: syncApi.disconnect,
        isConnected: syncApi.isConnected
      }
    )

    api.reset = reset.bind(null, dbName, CustomPouchDB, state, api, storeApi.clear, emitter, remoteBaseUrl, remote, ajaxOptions, PouchDB)
  })
}
