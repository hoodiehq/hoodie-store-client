module.exports = generateId

// uuids consist of numbers and lowercase letters only.
// We stick to lowercase letters to prevent confusion
// and to prevent issues with CouchDB, e.g. database
// names only allow for lowercase letters.
var CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')

function generateId (length) {
  var id = ''
  var radix = CHARS.length

  // default uuid length to 7
  if (length === undefined) {
    length = 7
  }

  for (var i = 0; i < length; i++) {
    var rand = Math.random() * radix
    var c = CHARS[Math.floor(rand)]
    id += String(c).charAt(0)
  }

  return id
}
