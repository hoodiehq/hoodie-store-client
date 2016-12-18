module.exports = isPersistent

function isPersistent (state) {
  return state.db.adapter !== 'memory'
}
