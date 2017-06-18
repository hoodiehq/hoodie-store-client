module.exports = uniqueName

var nr = 0
function uniqueName () {
  return 'db-' + (++nr)
}
