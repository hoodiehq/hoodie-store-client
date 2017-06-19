module.exports = reset

var disconnect = require('./disconnect')

function reset (state) {
  return disconnect(state)

  .then(function () {
    return state.db.destroy()
  })

  .then(function () {
    state.db = new state.PouchDB(state.dbName)
  })
}
