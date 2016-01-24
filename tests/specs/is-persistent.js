var merge = require('lodash/merge')
var test = require('tape')
var simple = require('simple-mock')
var isPersistent = require('../../lib/is-persistent')
var internals = isPersistent.internals
var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('.isPersistent()', function (t) {
  var store = new Store('test-db-is-persistent', merge({remote: 'test-db-is-persistent-remote'}, options))
  t.is(typeof store.isPersistent, 'function', 'exists')

  simple.mock(internals, 'humbleLocalStorage', {isPersistent: true})
  t.is(store.isPersistent(), true, 'returns true if humbleLocalStorage.isPersistent is true')

  simple.mock(internals, 'humbleLocalStorage', {isPersistent: false})
  t.is(store.isPersistent(), false, 'returns false if humbleLocalStorage.isPersistent is false')

  simple.restore()
  t.end()
})
