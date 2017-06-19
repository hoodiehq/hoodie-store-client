module.exports = disconnect

var Promise = require('lie')

/**
 * disconnects local and remote database
 *
 * @return {Promise}
 */
function disconnect (state) {
  if (state.replication) {
    state.replication.cancel()
    delete state.replication
    state.emitter.emit('disconnect')
  }

  return Promise.resolve()
}
