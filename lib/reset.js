module.exports = reset

var merge = require('lodash/merge')

var subscribeToSyncEvents = require('./subscribe-to-sync-events')

function reset (dbName, options, state, api, emitter) {
  return api.disconnect()

  .then(function () {
    return state.db.destroy()
  })

  .then(function () {
    state.db = new options.PouchDB(dbName)
    var syncApi = state.db.hoodieSync(options)

    subscribeToSyncEvents(syncApi, emitter)

    merge(
      api,
      {
        db: state.db,
        add: require('./add').bind(null, state, null),
        find: require('./find').bind(null, state, null),
        findAll: require('./find-all').bind(null, state, null),
        findOrAdd: require('./find-or-add').bind(null, state, null),
        update: require('./update').bind(null, state, null),
        updateOrAdd: require('./update-or-add').bind(null, state, null),
        updateAll: require('./update-all').bind(null, state, null),
        remove: require('./remove').bind(null, state, null),
        removeAll: require('./remove-all').bind(null, state, null),
        withIdPrefix: require('./with-id-prefix').bind(null, state),
        on: require('./on').bind(null, state),
        one: require('./one').bind(null, state),
        off: require('./off').bind(null, state)
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

    api.reset = reset.bind(null, dbName, options, state, api, emitter)
  })
}
