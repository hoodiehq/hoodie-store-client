module.exports = connect

var Promise = require('lie')

/**
 * connects local and remote database
 *
 * @return {Promise}
 */
function connect (state) {
  return Promise.resolve(state.remote)

  .then(function (remote) {
    if (state.replication) {
      return
    }

    state.replication = state.db.sync(remote, {
      create_target: true,
      live: true,
      retry: true
    })

    state.replication.on('error', function (error) {
      state.emitter.emit('error', error)
    })

    state.replication.on('change', function (change) {
      for (var i = 0; i < change.change.docs.length; i++) {
        state.emitter.emit(change.direction, change.change.docs[i])
      }
    })

    state.emitter.emit('connect')
  })
}
