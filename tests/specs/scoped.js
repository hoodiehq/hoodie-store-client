var merge = require('lodash/merge')
var test = require('tape')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('scoped method', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped', merge({remote: 'test-db-scoped'}, options))

  t.is(typeof store, 'function', 'has "scoped" method')
})

test('store("test") with methods', function (t) {
  t.plan(12)

  var store = new Store('test-db-scoped-store', merge({remote: 'test-db-scoped-store'}, options))
  var testStore = store('test')

  t.is(typeof testStore.add, 'function', 'has "add" method')
  t.is(typeof testStore.find, 'function', 'has "find" method')
  t.is(typeof testStore.findOrAdd, 'function', 'has "findOrAdd" method')
  t.is(typeof testStore.findAll, 'function', 'has "findAll" method')
  t.is(typeof testStore.update, 'function', 'has "update" method')
  t.is(typeof testStore.updateOrAdd, 'function', 'has "updateOrAdd" method')
  t.is(typeof testStore.updateAll, 'function', 'has "updateAll" method')
  t.is(typeof testStore.remove, 'function', 'has "remove" method')
  t.is(typeof testStore.removeAll, 'function', 'has "removeAll" method')
  t.is(typeof testStore.on, 'function', 'has "on" method')
  t.is(typeof testStore.one, 'function', 'has "one" method')
  t.is(typeof testStore.off, 'function', 'has "off" method')
})

test('scoped Store .on("change") with adding one', function (t) {
  t.plan(4)

  var store = new Store('test-db-scoped-add', merge({remote: 'test-db-scoped-add'}, options))
  var testStore = store('test')
  var otherStore = store('other')
  var changeEvents = []

  testStore.on('change', addEventToArray.bind(null, changeEvents))
  otherStore.on('change', addEventToArray.bind(null, changeEvents))
  store.on('change', addEventToArray.bind(null, changeEvents))

  testStore.add({
    foo: 'bar'
  })

  .then(function () {
    t.is(changeEvents.length, 2, 'triggers 1 change event for scoped and general store each')
    t.is(changeEvents[0].eventName, 'add', 'passes the event name')
    t.is(changeEvents[0].object.foo, 'bar', 'event passes object')
    t.is(changeEvents[0].object.type, 'test', 'event passes object with scoped type')
  })
})

test('scoped Store .find()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-find', merge({remote: 'test-db-scoped-find'}, options))
  var testStore = store('test')

  var testItems = [{ foo: 'bar1' }, { foo: 'bar2' }]

  testStore.add(testItems)

  .then(function (items) {
    return testStore.find(items[0].id)
  })

  .then(function (result) {
    t.is(typeof result, 'object', 'returns an object')
    t.is(result.type, 'test', 'returns the correct object type')
  })

  .catch(t.fail)
})

test('scoped Store .find(array) items not found', function (t) {
  t.plan(5)

  var store = new Store('test-db-scoped-find', merge({remote: 'test-db-scoped-find'}, options))
  var testStore = store('test')

  var testItems = [{ id: 'bar1' }, { id: 'bar2' }]

  testStore.add(testItems)

  .then(function (items) {
    return testStore.find([{ id: 'non-existing1' }, { id: 'non-existing2' }])
  })

  .then(function (notFoundErrors) {
    t.is(notFoundErrors.length, 2, 'not found error returned for each item')

    t.true(notFoundErrors[0] instanceof Error, 'first rejects with an error object')
    t.is(notFoundErrors[0].name, 'Not found', 'first error message is correct')

    t.true(notFoundErrors[1] instanceof Error, 'second rejects with an error object')
    t.is(notFoundErrors[1].name, 'Not found', 'second error message is correct')
  })

  .catch(t.fail)
})

test('scoped Store .find() not found error for out of scope items', function (t) {
  t.plan(6)

  var store = new Store('test-db-scoped-find', merge({remote: 'test-db-scoped-find'}, options))

  var testItems = [{ foo: 'bar1', type: 'test1' }, { foo: 'bar2', type: 'test2' }]
  var addedItems

  store.add(testItems)

  .then(function (items) {
    addedItems = items
    return store('test2').find(items)
  })

  .then(function (results) {
    t.is(results.length, 2, 'returns array of the same size as input array')

    t.true(results[0] instanceof Error, 'out of scope item in the correct array position')
    var expectedMessage = 'Object with type "test2" and id "' + addedItems[0].id + '" is missing'
    t.is(results[0].name, 'Not found', 'out of scope item not found')
    t.is(results[0].status, 404, 'out of scope item status of 404')
    t.is(results[0].message, expectedMessage, 'out of scope error as expected')

    t.is(results[1].id, addedItems[1].id, 'in-scope item found and in correct array position')
  })

  .catch(t.fail)
})

test('scoped Store .findAll()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-find-all', merge({remote: 'test-db-scoped-find-all'}, options))
  var testStore = store('test')

  var testItems = [{ foo: 'bar1' }, { foo: 'bar2' }]

  testStore.add(testItems)

  .then(function () {
    return testStore.findAll()
  })

  .then(function (results) {
    t.is(results.length, 2, 'returns correct number of items')
    t.is(results[1].type, 'test', 'returns correct type of object')
  })
})

test('scoped Store .findAll(filterFunction)', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-find-all-filtered', merge({remote: 'test-db-scoped-find-all-filtered'}, options))
  var testStore = store('test')

  var testItems = [{ foo: 'bar1' }, { foo: 'bar2' }]

  testStore.add(testItems)

  .then(function () {
    return testStore.findAll(function (item) {
      return item.foo === 'bar2'
    })
  })

  .then(function (results) {
    t.is(results.length, 1, 'returns correct number of items')
    t.is(results[0].type, 'test', 'returns correct type of object')
  })
})

test('scoped Store .findOrAdd(object)', function (t) {
  t.plan(3)

  var store = new Store('test-db-scoped-find-add', merge({remote: 'test-db-scoped-find-add'}, options))
  var testStore = store('test')
  var otherStore = store('other')
  var changeEvents = []

  testStore.on('change', addEventToArray.bind(null, changeEvents))
  otherStore.on('change', addEventToArray.bind(null, changeEvents))
  store.on('change', addEventToArray.bind(null, changeEvents))

  var testItem = {
    id: 'new',
    foo: 'bar1'
  }

  testStore.findOrAdd(testItem)

  .then(function (result) {
    t.is(result.foo, 'bar1', 'returns new object')
    t.is(result.type, 'test', 'returns correct type of object')
    t.is(changeEvents.length, 2, 'returns correct number of events fired')
  })

  .catch(t.fail)
})

test('scoped Store .findOrAdd(id, object)', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-find-add', merge({remote: 'test-db-scoped-find-add'}, options))
  var testStore = store('test')

  var testId = 'new'
  var testItem = {
    foo: 'bar1'
  }

  testStore.findOrAdd(testId, testItem)

  .then(function (result) {
    t.is(result.foo, 'bar1', 'returns new object')
    t.is(result.type, 'test', 'returns correct type of object')
  })

  .catch(t.fail)
})

test('scoped Store .findOrAdd([object, object])', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-find-add', merge({remote: 'test-db-scoped-find-add'}, options))
  var testStore = store('test')

  var testItems = [
    {
      id: 'new',
      foo: 'bar1'
    },
    {
      id: 'alsoNew',
      foo: 'bar2'
    }
  ]

  testStore.findOrAdd(testItems)

  .then(function (results) {
    t.is(results.length, 2, 'returns found object')
    t.is(results[0].type, 'test', 'returns correct type of object')
  })

  .catch(t.fail)
})

test('scoped Store .findOrAdd([object]) with missing item calls add', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-find-add-missing', merge({remote: 'test-db-scoped-find-add-missing'}, options))
  var testStore = store('test')

  var testItem = {
    id: 'new',
    foo: 'bar1'
  }

  testStore.findOrAdd([testItem])
    .then(function (results) {
      t.is(results.length, 1, 'returns found object')
    })
})

test('scoped Store .findOrAdd() with missing id throws an error', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-find-add', merge({remote: 'test-db-scoped-find-add'}, options))
  var testStore = store('test')

  var testItem = {
    foo: 'bar1'
  }

  testStore.findOrAdd(testItem)
    .catch(function (err) {
      t.is(err.message, 'Missing ID', 'error has correct message')
    })
})

test('scoped Store .findOrAdd(string) with missing new object throws an error', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-find-add', merge({remote: 'test-db-scoped-find-add'}, options))
  var testStore = store('test')

  testStore.findOrAdd('newstringid')
    .catch(function (err) {
      t.is(err.message, 'Missing ID', 'error has correct message')
    })
})

test('scoped Store .findOrAdd(string, object) with missing item sets id to new object', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-find-add', merge({remote: 'test-db-scoped-find-add'}, options))
  var testStore = store('test')

  testStore.findOrAdd('theidoftheobject', {})
    .then(function (result) {
      t.is(result.id, 'theidoftheobject', 'the object has the new id')
    })
})

test('scoped Store .update()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-update', merge({remote: 'test-db-scoped-update'}, options))
  var testStore = store('test')

  var testItem = { foo: 'bar1' }

  testStore.add(testItem)

  .then(function (item) {
    return testStore.update(item.id, { foo: 'bar2' })
  })

  .then(function (newItem) {
    t.is(newItem.foo, 'bar2', 'returns updated item')
    t.is(newItem.type, 'test', 'returns correctly typed item')
  })
})

test('scoped Store .update() updates the correct scope', function (t) {
  t.plan(7)

  var store = new Store('test-db-scoped-update', merge({remote: 'test-db-scoped-update'}, options))

  var testItems = [
    { foo: 'bar1', id: 'id1', type: 'test2' },
    { foo: 'bar2', id: 'id2', type: 'test1' },
    { foo: 'bar3', id: 'id3', type: 'test2' }
  ]

  store.add(testItems)

  .then(function (items) {
    return store('test2').update([
      { id: 'id1', foo: 'bar20' },
      { id: 'id2', foo: 'bar10' },
      { id: 'id3', foo: 'bar100' }
    ])
  })

  .then(function (newItem) {
    t.is(newItem.length, 3, 'returns results for both items')

    t.is(newItem[0].foo, 'bar20', 'returns updated testStore2 item')
    t.is(newItem[0].type, 'test2', 'returns correctly typed item')

    t.true(newItem[1] instanceof Error, 'returns error for item out of scope')
    t.is(newItem[1].name, 'Not found', 'returns not found error')

    t.is(newItem[2].foo, 'bar100', 'returns updated testStore2 item')
    t.is(newItem[2].type, 'test2', 'returns correctly typed item')
  })

  .catch(t.fail)
})

test('scoped Store .updateOrAdd()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-update-or-add', merge({remote: 'test-db-scoped-update-add'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItem) {
    testItems[0] = {
      id: addedItem[0].id,
      foo: 'bar3'
    }
    testItems.push({
      id: 'new',
      foo: 'bar2'
    })

    return testStore.updateOrAdd(testItems)
  })

  .then(function (items) {
    t.is(items[0].foo, 'bar3', 'returns updated item')
    t.is(items[1].type, 'test', 'returns correctly typed item')
  })
})

test('scoped Store .updateOrAdd(item) with item found updates', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-update-or-add', merge({remote: 'test-db-scoped-update-add'}, options))
  var testStore = store('test')

  var testItem = {
    foo: 'bar1'
  }

  return testStore.add(testItem)

  .then(function (addedItem) {
    addedItem.foo = 'bar10'
    return testStore.updateOrAdd(addedItem)
  })

  .then(function (updatedItem) {
    t.is(updatedItem.foo, 'bar10', 'first item updated')
  })
})

test('scoped Store .updateOrAdd(array) with no items found adds all items', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-update-or-add', merge({remote: 'test-db-scoped-update-add'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      bar: 'baz1'
    }
  ]

  return testStore.updateOrAdd(testItems)

  .then(function (items) {
    t.is(items[0].foo, 'bar1', 'first item added')
    t.is(items[1].bar, 'baz1', 'second item added')
  })
})

test('scoped Store .updateOrAdd(item)', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-update-add-item', merge({remote: 'test-db-scoped-update-add-item'}, options))
  var testStore = store('test')

  var testItem = {
    id: 'new',
    foo: 'bar1'
  }

  testStore.updateOrAdd(testItem)

  .then(function (item) {
    t.is(item.foo, 'bar1', 'adds new item')
  })
})

test('scoped Store .updateOrAdd(object) with missing id throws an error', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-update-add', merge({remote: 'test-db-scoped-update-add'}, options))
  var testStore = store('test')

  var testItem = {
    foo: 'bar1'
  }

  testStore.updateOrAdd(testItem)
    .catch(function (err) {
      t.is(err.message, 'Missing ID', 'error has correct message')
    })
})

test('scoped Store .updateOrAdd(string) with missing new object throws an error', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-update-add', merge({remote: 'test-db-scoped-update-add'}, options))
  var testStore = store('test')

  testStore.updateOrAdd('newstringid')
    .catch(function (err) {
      t.is(err.message, 'Missing ID', 'error has correct message')
    })
})

test('scoped Store .updateOrAdd(string, object) with missing item sets id to new object', function (t) {
  t.plan(1)

  var store = new Store('test-db-scoped-update-add', merge({remote: 'test-db-scoped-update-add'}, options))
  var testStore = store('test')

  testStore.updateOrAdd('theidoftheobject', {})
    .then(function (result) {
      t.is(result.id, 'theidoftheobject', 'the object has the new id')
    })
})

test('scoped Store .updateAll()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-update-all', merge({remote: 'test-db-scoped-update-all'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      foo: 'bar2'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItems) {
    return testStore.updateAll({
      newProp: 'data'
    })
  })

  .then(function (updatedItems) {
    t.is(updatedItems.length, 2, 'correct number of items returned')
    t.is(updatedItems[0].newProp, 'data', 'returns items with correct update')
  })
})

test('scoped Store .remove()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-remove', merge({remote: 'test-db-scoped-remove'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      foo: 'bar2'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItems) {
    return testStore.remove(addedItems[0].id)
  })

  .then(function (removedItem) {
    t.is(removedItem.foo, 'bar1', 'returns correctly removed item')
    t.is(removedItem._deleted, true, 'returns item as removed')
  })
})

test('scoped Store .remove(change)', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-remove-change', merge({remote: 'test-db-scoped-remove-change'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      foo: 'bar2'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItems) {
    return testStore.remove(addedItems[0].id, { foo: 'bar3' })
  })

  .then(function (removedItem) {
    t.is(removedItem.foo, 'bar3', 'returns correctly removed item')
    t.is(removedItem._deleted, true, 'returns item as removed')
  })
})

test('scoped Store .remove(array, change)', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-remove-array-change', merge({remote: 'test-db-scoped-remove-array-change'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      foo: 'bar2'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItems) {
    return testStore.remove(addedItems, { foo: 'bar3' })
  })

  .then(function (removedItems) {
    t.is(removedItems[1].foo, 'bar3', 'returns correctly removed item')
    t.is(removedItems[0]._deleted, true, 'returns item as removed')
  })
})

test('scoped Store .removeAll()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-remove-all', merge({remote: 'test-db-scoped-remove-all'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      foo: 'bar2'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItems) {
    return testStore.removeAll()
  })

  .then(function (removedItems) {
    t.is(removedItems.length, 2, 'returns correctly removed items')
    t.is(removedItems[1]._deleted, true, 'returns item as removed')
  })

  .catch(t.fail)
})

test('scoped Store .removeAll(filterFunction)', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-remove-all-filter', merge({remote: 'test-db-scoped-remove-all-filter'}, options))
  var testStore = store('test')

  var testItems = [
    {
      foo: 'bar1'
    },
    {
      foo: 'bar2'
    }
  ]

  return testStore.add(testItems)

  .then(function (addedItems) {
    return testStore.removeAll(function (item) {
      return item.foo === 'bar2'
    })
  })

  .then(function (removedItems) {
    t.is(removedItems.length, 1, 'returns correctly removed items')
    t.is(removedItems[0]._deleted, true, 'returns item as removed')
  })

  .catch(t.fail)
})

test('.removeAll() with a non-existent scope returns empty list', function (t) {
  t.plan(1)

  var store = new Store('test-remove-all-bad-scope', merge({remote: 'test-remove-all-bad-scope'}, options))
  var testStore = store('test')

  return testStore.removeAll()

  .then(function (removedItems) {
    t.is(removedItems.length, 0, 'removedItems is empty')
  })

  .catch(t.fail)
})

test('scoped Store .one()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-one', merge({remote: 'test-db-scoped-one'}, options))
  var testStore = store('test')
  var changeEvents = []

  testStore.one('change', addEventToArray.bind(null, changeEvents))

  var testItem = { foo: 'bar1' }

  testStore.add(testItem)

  .then(function (addedItem) {
    t.is(changeEvents.length, 1, 'change event fired once')

    return testStore.update(addedItem.id, { foo: 'bar2' })
  })

  .then(function (updatedItem) {
    t.is(changeEvents.length, 1, 'no change event fired')
  })
})

test('scoped Store .off()', function (t) {
  t.plan(2)

  var store = new Store('test-db-scoped-off', merge({remote: 'test-db-scoped-off'}, options))
  var testStore = store('test')
  var changeEvents = []

  var changeHandler = function (object) {
    addEventToArray(changeEvents, object)
  }

  testStore.on('change', changeHandler)

  var testItem = { foo: 'bar1' }

  testStore.add(testItem)

  .then(function (addedItem) {
    t.is(changeEvents.length, 1, 'change event fired once')

    testStore.off('change', changeHandler)

    return testStore.update(addedItem.id, { foo: 'bar2' })
  })

  .then(function (updatedItem) {
    t.is(changeEvents.length, 1, 'no change event fired')
  })
})

test('when type change', function (t) {
  t.plan(10)

  var store = new Store('test-db-type-change', merge({remote: 'test-db-type-change'}, options))
  var scopedStoreOldType = store('oldtype')
  var scopedStoreNewType = store('newtype')
  store.add({ id: 'test', type: 'oldtype' })

  .then(function () {
    scopedStoreOldType.on('remove', function (object) {
      scopedStoreOldType
      .find(object.id)
      .catch(function () {
        t.pass('cannot find object in scopedStoreOldType')
      })

      t.is(object.type, 'oldtype', 'in remove event on scopedStoreOldType, type is "oldtype"')
      t.is(object.foo, 'bar', 'in remove event on scopedStoreOldType, foo is "bar"')
    })
    scopedStoreOldType.on('change', function (object) {
      t.assert(true, 'scopedStoreOldType fired change event on remove')
    })

    scopedStoreNewType.on('add', function (object) {
      scopedStoreNewType
      .find(object.id)
      .then(function (foundObj) {
        t.deepEqual(foundObj, object, 'in add event on scopedStoreNewType, object is present in store')
      })
      .catch(t.fail)

      t.is(object.type, 'newtype', 'in add event on scopedStoreNewType, type is newtype')
      t.is(object.foo, 'bar', 'in add event on scopedStoreNewType, foo is bar')
    })
    scopedStoreNewType.on('change', function (object) {
      t.assert(true, 'scopedStoreNewType fired change event on remove')
    })

    store.on('update', function (object) {
      t.is(object.type, 'newtype', 'in update event on global store, type is newtype')
      t.is(object.foo, 'bar', 'in update event on global store, foo is bar')
    })

    store.on('add', function () {
      t.fail('"add" must not be triggered on store when type changes')
    })

    store.on('remove', function () {
      t.fail('"remove" must not be triggered on store when type changes')
    })

    scopedStoreOldType.on('update', function () {
      t.fail('"update" must not be triggered on store(oldType) when type changes')
    })
    scopedStoreNewType.on('update', function () {
      // t.fail('"update" must not be triggered on store(newType) when type changes')
    })

    return store.update('test', {type: 'newtype', foo: 'bar'})
  })

  .catch(t.fail)
})

test('store.add should invoke store.on("add") and store.on("change") with event "add"', function (t) {
  t.plan(3)
  var store = new Store('test-db-scoped-off', merge({remote: 'test-db-scoped-off'}, options))
  var onEvents = []

  store.on('add', function () {
    onEvents.push('add')
  })

  store.on('remove', function () {
    onEvents.push('remove')
  })

  store.on('update', function () {
    onEvents.push('update')
  })

  store.on('change', function (event) {
    onEvents.push('change ' + event)
  })

  store.add({'name': 'Knut'}).then(function () {
    t.is(onEvents.length, 2, 'There should be two Elements in the onEvents array')
    t.is(onEvents[0], 'add', '"add" should trigger')
    t.is(onEvents[1], 'change add', '"change add" should trigger')
  })
  .catch(t.fail)
})

test('.store() without a type throws a TypeError', function (t) {
  t.plan(2)

  var store = new Store('test-type-error', merge({remote: 'test-type-error'}, options))

  try {
    store().add({ foo: 'bar' })
    t.fail()
  } catch (error) {
    t.true(error instanceof TypeError, 'throws TypeError')
    t.is(error.message, 'type must be set for scoped stores', 'Correct error message is passed')
  }
})

test('scoped store methods with type conflict', function (t) {
  t.plan(22)
  var store = new Store('test-type-conflicts', merge({remote: 'test-type-conflicts'}, options))
  var fooStore = store('foo')
  var expectedMessage = 'type field in document does not match scoped store type of \'foo\''

  function verifyError (methodType, error) {
    t.true(error instanceof TypeError, 'TypeError on scoped .' + methodType + '() type conflict')
    t.is(error.message, expectedMessage, 'correct error message is displayed')
  }

  fooStore.add({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'add'))

  fooStore.find({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'find'))

  fooStore.findOrAdd({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'findOrAdd'))

  fooStore.update({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'update'))

  fooStore.updateOrAdd({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'updateOrAdd'))

  fooStore.updateAll({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'updateAll'))

  fooStore.remove({ type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'remove'))

  // test second argument
  fooStore.findOrAdd('abc123', { type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'findOrAdd'))

  fooStore.update('abc123', { type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'update'))

  fooStore.updateOrAdd('abc123', { type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'updateOrAdd'))

  fooStore.remove('abc123', { type: 'bar' })
    .then(t.fail)
    .catch(verifyError.bind(null, 'remove'))
})

test('scoped store.add should invoke store.on("add") and store.on("change") with event "add"', function (t) {
  t.plan(3)
  var store = new Store('test-db-scoped-on', merge({remote: 'test-db-scoped-on'}, options))
  var onEvents = []

  store('test').on('add', function (person) {
    onEvents.push('add')
  })

  store('test').on('remove', function (person) {
    onEvents.push('remove')
  })

  store('test').on('update', function (person) {
    onEvents.push('update')
  })

  store('test').on('change', function (event, person) {
    onEvents.push('change ' + event)
  })

  store('test').add({'name': 'Knut'}).then(function () {
    t.is(onEvents.length, 2, 'There should be two Elements in the onEvents array')
    t.is(onEvents[0], 'add', '"add" should trigger')
    t.is(onEvents[1], 'change add', '"change add" should trigger')
  })

  .then(function () {
    store.reset()
  })

  .catch(t.fail)
})

test('scoped store.removeAll should invoke store.on("remove")', function (t) {
  t.plan(2)
  var store = new Store('test-db-scoped-on', merge({remote: 'test-db-scoped-on'}, options))
  var onEvents = []

  store('test').on('add', function () {
    onEvents.push('add')
  })

  store('test').on('remove', function () {
    onEvents.push('remove')
  })

  store('test').on('update', function () {
    onEvents.push('update')
  })

  store('test').on('change', function (event) {
    onEvents.push('change ' + event)
  })

  store('test').add({'name': 'Knut'})

  .then(function () {
    return store('test').removeAll()

    .then(function () {
      t.is(onEvents.length, 4, 'There should be four Elements in the onEvents array')
      t.is(onEvents[2], 'remove', '"remove" should trigger')
    })
  })

  .then(function () {
    store.reset()
  })

  .catch(t.fail)
})

function addEventToArray (array, object) {
  if (arguments.length > 2) {
    arguments[0].push({
      eventName: arguments[1],
      object: arguments[2]
    })
  } else {
    arguments[0].push({
      object: arguments[1]
    })
  }
}
