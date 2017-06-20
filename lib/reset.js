module.exports = reset

var disconnect = require('./disconnect')
var startListenToChanges = require('./helpers/start-listen-to-changes')

function reset (state) {
  return disconnect(state)

  .then(function () {
    return state.db.destroy()
  })

  .then(function () {
    state.db = new state.PouchDB(state.dbName)
    startListenToChanges(state)
  })
}
