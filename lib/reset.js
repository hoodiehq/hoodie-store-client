module.exports = reset

var handleChanges = require('./helpers/handle-changes')
var disconnect = require('./disconnect')

function reset (state) {
  return state.bootstrap

  .then(function () {
    return disconnect(state)
  })

  .then(function () {
    return state.db.destroy()
  })

  .then(function () {
    state.emitter.emit('reset')
    state.db = new state.PouchDB(state.dbName)
    handleChanges(state)
  })
}
