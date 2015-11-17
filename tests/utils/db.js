var PouchDB = process.browser ? global.PouchDB : require('pouchdb')

module.exports = function (name) {
  var options = process.browser ? {
    adapter: 'memory'
  } : {
    db: require('memdown')
  }

  return new PouchDB(name, options)
}
