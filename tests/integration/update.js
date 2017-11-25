var test = require('tape')
var lolex = require('lolex')

var PouchDB = require('../utils/pouchdb.js')
var Store = require('../../')
var uniqueName = require('../utils/unique-name')

test('store.update() exists', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  t.is(typeof store.update, 'function', 'has method')
})

test('store.update(id, changedProperties)', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add({
    _id: 'exists',
    foo: 'bar'
  })

  .then(function () {
    return store.update('exists', {
      foo: 'baz'
    })
  })

  .then(function (object) {
    t.ok(object._id)
    t.ok(/^2-/.test(object._rev), 'revision is 2')
    t.is(object.foo, 'baz', 'passes properties')
  })
})

test('store.update(id)', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.update('nothinghere')

  .catch(function (error) {
    t.ok(error instanceof Error, 'rejects error')
  })
})

test('store.update("unknown", changedProperties)', function (t) {
  t.plan(1)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.update('unknown', {foo: 'bar'})

  .catch(function (error) {
    t.ok(error instanceof Error, 'rejects error')
  })
})

test('store.update("unknown", changedProperties) returns custom not found error', function (t) {
  t.plan(2)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.update('unknown', {foo: 'bar'})

  .catch(function (error) {
    t.is(error.name, 'Not found', 'rejects with custom name')
    t.is(error.message, 'Object with id "unknown" is missing', 'rejects with custom message')
  })
})

test('store.update(id, updateFunction)', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add({ _id: 'exists' })

  .then(function () {
    return store.update('exists', function (object) {
      object.foo = object._id + 'bar'
    })
  })

  .then(function (object) {
    t.ok(object._id)
    t.ok(/^2-/.test(object._rev))
    t.is(object.foo, 'existsbar', 'resolves properties')
  })
})

test('store.update(id, updateFunction) fails validation', function (t) {
  t.plan(5)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name,
    validate: function (doc) {
      if (doc.foo) {
        throw new Error()
      }
    }
  })

  store.add({ _id: 'exists' })

  .then(function () {
    return store.update('exists', function (object) {
      object.foo = object._id + 'bar'
    })
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError')
    t.is(error.message, 'document validation failed')

    return null
  })

  .then(function () {
    return store.find('exists')
  })

  .then(function (doc) {
    t.is(doc._id, 'exists')
    t.false(/^2-/.test(doc._rev))
    t.is(doc.foo, undefined)
  })
})

test('store.update(object)', function (t) {
  t.plan(3)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add({ _id: 'exists' })

  .then(function () {
    return store.update({
      _id: 'exists',
      foo: 'bar'
    })
  })

  .then(function (object) {
    t.ok(object._id, 'resolves with id')
    t.ok(/^2-/.test(object._rev), 'resolves with new rev number')
    t.is(object.foo, 'bar', 'resolves with properties')
  })
})

test('store.update(array)', function (t) {
  t.plan(6)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add([
    { _id: '1', foo: 'foo', bar: 'foo' },
    { _id: '2', foo: 'bar' }
  ])

  .then(function () {
    return store.update([
      { _id: '1', bar: 'baz' },
      { _id: '2', bar: 'baz' }
    ])
  })

  .then(function (objects) {
    t.is(objects[0]._id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, 'baz')

    t.is(objects[1]._id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, 'baz')
  })
})

test('store.update(array) with non-existent object', function (t) {
  t.plan(4)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add({ _id: 'exists' })

  .then(function () {
    return store.update([
      { _id: 'exists', foo: 'bar' },
      { _id: 'unknown', foo: 'baz' }
    ])
  })

  .then(function (objects) {
    t.is(objects[0]._id, 'exists')
    t.is(objects[0].foo, 'bar')
    t.is(parseInt(objects[0]._rev, 10), 2)
    t.is(objects[1].status, 404)
  })
})

test('store.update(array) returns custom not found error for non-existent object', function (t) {
  t.plan(2)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add({ _id: 'exists' })

  .then(function () {
    return store.update([
      { _id: 'exists', foo: 'bar' },
      { _id: 'unknown', foo: 'baz' }
    ])
  })

  .then(function (objects) {
    t.is(objects[1].name, 'Not found', 'rejects with custom name for unknown')
    t.is(objects[1].message, 'Object with id "unknown" is missing', 'rejects with custom message for unknown')
  })
})

// https://github.com/boennemann/pouchdb-hoodie-api/issues/9
test('store.update(array) with invalid objects', function (t) {
  t.plan(5)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add([
    { _id: 'exists' },
    { _id: 'foo' }
  ])

  .then(function () {
    return store.update([
      { _id: 'exists', foo: 'bar' },
      'foo',
      []
    ])
  })

  .then(function (objects) {
    t.is(objects[0]._id, 'exists')
    t.is(objects[0].foo, 'bar')
    t.is(parseInt(objects[0]._rev, 10), 2)

    t.is(objects[1].status, 400)
    t.is(objects[2].status, 404)
  })
})

test('store.update(array, changedProperties)', function (t) {
  t.plan(7)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add([
    { _id: '1', foo: 'foo', bar: 'foo' },
    { _id: '2', foo: 'bar' }
  ])

  .then(function () {
    return store.update([{_id: '1'}, '2'], {
      bar: 'baz'
    })
  })

  .then(function (objects) {
    t.is(objects[0]._id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, 'baz')
    t.is(parseInt(objects[0]._rev, 10), 2)

    t.is(objects[1]._id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, 'baz')
  })
})

// https://github.com/boennemann/pouchdb-hoodie-api/issues/9
test('store.update(array, changedProperties) with non-existent objects', function (t) {
  t.plan(5)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add([
    { _id: 'exists' }
  ])

  .then(function () {
    return store.update([
      'exists',
      'unknown'
    ], {foo: 'bar'})
  })

  .then(function (objects) {
    t.is(objects.length, 2)
    t.is(objects[0]._id, 'exists')
    t.is(objects[0].foo, 'bar')
    t.is(parseInt(objects[0]._rev, 10), 2)

    t.is(objects[1].status, 404)
  })
})

test('store.update(array, updateFunction)', function (t) {
  t.plan(6)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add([
    { _id: '1', foo: 'foo', bar: 'foo' },
    { _id: '2', foo: 'bar' }
  ])

  .then(function () {
    return store.update(['1', '2'], function (object) {
      object.bar = object._id + 'baz'
    })
  })

  .then(function (objects) {
    t.is(objects[0]._id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, '1baz')

    t.is(objects[1]._id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, '2baz')
  })
})

test('store.update(object) updates updatedAt timestamp', function (t) {
  t.plan(5)

  var clock = lolex.install(0, ['Date'])
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  var isValidDate = require('../utils/is-valid-date')

  store.add({
    _id: 'shouldHaveTimestamps'
  })

  .then(function () {
    clock.tick(100)

    store.update({
      _id: 'shouldHaveTimestamps',
      foo: 'bar'
    })
  })

  store.on('update', function (object) {
    t.is(object._id, 'shouldHaveTimestamps', 'resolves doc')
    t.is(typeof object.hoodie.deletedAt, 'undefined', 'deletedAt shouldnt be set')
    t.ok(isValidDate(object.hoodie.updatedAt), 'updatedAt should be a valid date')
    t.is(new Date().toISOString(), object.hoodie.updatedAt, 'updatedAt should be the same time as right now')
    t.not(object.hoodie.createdAt, object.hoodie.updatedAt, 'createdAt and updatedAt should not be the same')

    clock.uninstall()
  })
})

test('store.update([objects]) updates updatedAt timestamps', function (t) {
  t.plan(10)

  var clock = lolex.install(0, ['Date'])
  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  var isValidDate = require('../utils/is-valid-date')

  var updatedCount = 0
  var objectsToAdd = [{
    _id: 'shouldHaveTimestamps'
  }, {
    _id: 'shouldAlsoHaveTimestamps'
  }]

  store.add(objectsToAdd)

  .then(function () {
    clock.tick(100)
    store.update(objectsToAdd, { foo: 'bar' })
  })

  store.on('update', function (object) {
    t.ok(object._id, 'resolves doc')
    t.is(typeof object.hoodie.deletedAt, 'undefined', 'deletedAt shouldnt be set')
    t.ok(isValidDate(object.hoodie.updatedAt), 'updatedAt should be a valid date')
    t.is(new Date().toISOString(), object.hoodie.updatedAt, 'updatedAt should be the same time as right now')
    t.not(object.hoodie.createdAt, object.hoodie.updatedAt, 'createdAt and updatedAt should not be the same')

    if (++updatedCount === objectsToAdd.length) {
      clock.uninstall()
    }
  })
})

test('store.update(object) ignores .hoodie property', function (t) {
  t.plan(4)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add({ _id: 'exists' })

  .then(function () {
    return store.update({
      _id: 'exists',
      foo: 'bar',
      hoodie: {ignore: 'me'}
    })
  })

  .then(function (object) {
    t.ok(object._id, 'resolves with id')
    t.ok(/^2-/.test(object._rev), 'resolves with new rev number')
    t.is(object.foo, 'bar', 'resolves with properties')
    t.is(object.hoodie.ignore, undefined, 'ignores .hoodie property')
  })
})

test('store.update(array)', function (t) {
  t.plan(7)

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name
  })

  store.add([
    { _id: '1', foo: 'foo', bar: 'foo' },
    { _id: '2', foo: 'bar' }
  ])

  .then(function () {
    return store.update([
      { _id: '1', bar: 'baz', hoodie: {ignore: 'me'} },
      { _id: '2', bar: 'baz' }
    ])
  })

  .then(function (objects) {
    t.is(objects[0]._id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, 'baz')
    t.is(objects[0].hoodie.ignore, undefined)

    t.is(objects[1]._id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, 'baz')
  })
})

test('store.update([objects], change) fails to update as one doc fails validation', function (t) {
  t.plan(12)

  var validationCallCount = 0

  var name = uniqueName()
  var store = new Store(name, {
    PouchDB: PouchDB,
    remote: 'remote-' + name,
    validate: function (doc) {
      if (validationCallCount > 2) {
        if (doc.foo === 'baz') {
          throw new Error('document validation failed')
        } else {
          ++validationCallCount
        }
      } else {
        return ++validationCallCount
      }
    }
  })

  return store.add([
    { _id: '1', foo: 'foo' },
    { _id: '2', foo: 'bar' },
    { _id: '3', foo: 'baz', bar: 'foo' }
  ])

  .then(function () {
    return store.update(
      [1, 2, 3],
      {
        bar: 'bar',
        hoodie: {ignore: 'me'}
      }
    )
  })

  .catch(function (error) {
    t.is(validationCallCount, 5, 'needs to fail the validation for last object update')
    t.is(error.name, 'ValidationError')
    t.is(error.message, 'document validation failed')

    return null
  })

  .then(store.findAll)

  .then(function (objects) {
    objects.forEach(function (object, idx) {
      t.ok(object.foo, 'old value remains')
      t.false(/^2-/.test(object._rev))

      if (idx === 2) {
        t.is(object.bar, 'foo', 'object not updated')
      } else {
        t.is(object.bar, undefined)
      }
    })
  })
})
