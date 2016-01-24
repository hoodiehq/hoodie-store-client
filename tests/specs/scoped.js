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
      id: addedItem.id,
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
      .catch(t.throws)

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
