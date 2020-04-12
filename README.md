# hoodie-store-client

> Hoodie Client for data persistence & offline sync

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-store-client.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-store-client)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-store-client/badge.svg?branch=master)](https://coveralls.io/github/hoodiehq/hoodie-store-client?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-store-client.svg)](https://david-dm.org/hoodiehq/hoodie-store-client)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-store-client/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-store-client#info=devDependencies)

## Example

```js
var Store = require('@hoodie/store-client')
var store = new Store('mydbname', {
  PouchDB: require('pouchdb'),
  remote: 'http://localhost:5984/mydbname'
})

// or
var PresetStore = Store.defaults({
  PouchDB: require('pouchdb'),
  remoteBaseUrl: 'http://localhost:5984'
})
var store = new PresetStore('mydb')
```

## API

- [Store.defaults](#storedefaults)
- [Constructor](#constructor)
- [store.add(properties)](#storeaddproperties)
- [store.add(arrayOfProperties)](#storeaddarrayofproperties)
- [store.find(id)](#storefindid)
- [store.find(doc)](#storefinddoc)
- [store.find(idsOrDocs)](#storefindidsordocs)
- [store.findOrAdd(id, doc)](#storefindoraddiddoc)
- [store.findOrAdd(doc)](#storefindoradddoc)
- [store.findOrAdd(idsOrDocs)](#storefindoraddidsordocs)
- [store.findAll()](#storefindall)
- [store.update(id, changedProperties)](#storeupdateidchangedproperties)
- [store.update(id, updateFunction)](#storeupdateidupdatefunction)
- [store.update(doc)](#storeupdatedoc)
- [store.update(arrayOfDocs)](#storeupdatearrayofdocs)
- [store.updateOrAdd(id, doc)](#storeupdateoraddiddoc)
- [store.updateOrAdd(doc)](#storeupdateoradddoc)
- [store.updateOrAdd(arrayOfDocs)](#storeupdateoraddarrayofdocs)
- [store.updateAll(changedProperties)](#storeupdateallchangedproperties)
- [store.updateAll(updateFunction)](#storeupdateallupdatefunction)
- [store.remove(id)](#storeremoveid)
- [store.remove(doc)](#storeremovedoc)
- [store.remove(idsOrDocs)](#storeremoveidsordocs)
- [store.removeAll()](#storeremoveall)
- [store.pull()](#storepull)
- [store.push()](#storepush)
- [store.sync()](#storesync)
- [store.connect()](#storeconnect)
- [store.disconnect()](#storedisconnect)
- [store.isConnected()](#storeisconnected)
- [store.isPersistent()](#storeispersistent)
- [store.reset()](#storereset)
- [store.on()](#storeon)
- [store.one()](#storeone)
- [store.off()](#storeoff)
- [store.withIdPrefix](#storewithidprefix)
- [Events](#events)

### Store.defaults

```js
Store.defaults(options)
```

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`options.remoteBaseUrl`** | String | Base url to CouchDB. Will be used as remote prefix for store instances | No
| **`options.PouchDB`** | Constructor | [PouchDB custom builds](https://pouchdb.com/custom.html) | Yes

Returns a custom Store Constructor with passed default options.

Example

```js
var PresetStore = Store.defaults({
  remoteBaseUrl: 'http://localhost:5984'
})
var store = new PresetStore('mydb')
store.sync() // will sync with http://localhost:5984/mydb
```

### Constructor

```js
new Store(dbName, options)
```

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`dbName`** | String | name of the database | Yes
| **`options.remote`** | String | name or URL of remote database | Yes (unless `remoteBaseUrl` is preset, see [Store.defaults](#storedefaults))
| **`options.remote`** | Object | PouchDB instance | Yes (ignores `remoteBaseUrl` from [Store.defaults](#storedefaults))
| **`options.remote`** | Promise | Resolves to either string or PouchDB instance | see above
| **`options.PouchDB`** | Constructor | [PouchDB custom builds](https://pouchdb.com/custom.html) | Yes (unless preset using [Store.defaults](#storedefaults)))
| **`options.validate`** | Function(doc) | Validation function to execute before DB operations (Can return promise for async validation) | No

Returns `store` API.

Example

```js
var store = new Store('mydb', {
  PouchDB: PouchDB,
  remote: 'http://localhost:5984/mydb'
})
store.sync() // will sync with http://localhost:5984/mydb
```

Example with dynamic remote URL and ajax headers


```js
var loadAccount = require('./load-account')
var store = new Store('mydb', {
  PouchDB: PouchDB,
  get remote () {
    return loadAccount.then(function (account) {
      return new PouchDB('http://localhost:5984/' + encodeURIComponent('user/' + account.id), {
        ajax: {
          headers: {
            authorization: 'session ' + account.session.id
          }
        }
      })
    })
  }
})
store.sync() // will sync with http://localhost:5984/mydb
```

### store.add(properties)

```js
store.add(properties)
```

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`properties`** | Object | properties of document | Yes
| **`properties.id`** | String | If set, the document will be stored at given id | No

Resolves with `properties` and adds `id` (unless provided), `createdAt` and
`updatedAt` properties.

```json
{
  "id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "createdAt": "2016-05-09T12:00:00.000Z",
  "updatedAt": "2016-05-09T12:00:00.000Z"
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `properties` isn't an object. |
| Conflict | 409 | Object with id "id" already exists | An object with this `_id` already exists. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.add({foo: 'bar'}).then(function (doc) {
  alert(doc.foo) // bar
}).catch(function (error) {
  alert(error)
})
```

### store.add(arrayOfProperties)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`arrayOfProperties`** | Array | Array of `properties`, see store.add(properties) | Yes

Resolves with `properties` and adds `id` (unless provided), `createdAt` and
`updatedAt` properties. Resolves with array of `properties` items if called
with `propertiesArray`.

```json
{
  "id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "createdAt": "2016-05-09T12:00:00.000Z",
  "updatedAt": "2016-05-09T12:00:00.000Z"
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `properties` isn't an object. |
| Conflict | 409 | Object with id "id" already exists | An object with this `_id` already exists. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example: add single document

```js
store.add({foo: 'bar'}).then(function (doc) {
  alert(doc.foo) // bar
}).catch(function (error) {
  alert(error)
})
```

Example: add multiple documents

```js
store.add([{foo: 'bar'}, {bar: 'baz'}]).then(function (docs) {
  alert(docs.length) // 2
}).catch(function (error) {
  alert(error)
})
```

### store.find(id)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`id`** | String | Unique id of document | Yes

Resolves with `properties`

```json
{
  "id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "createdAt": "2016-05-09T12:00:00.000Z",
  "updatedAt": "2016-05-09T12:00:00.000Z"
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| Not found | 404 | Object with id "id" is missing | There is no object with this `_id`. |

Example

```js
store.find('12345678-1234-1234-1234-123456789ABC').then(function (doc) {
  alert(doc.id)
}).catch(function (error) {
  alert(error)
})
```

### store.find(doc)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`doc`** | Object | document with `id` property | Yes

Resolves with `properties`

```json
{
  "id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "createdAt": "2016-05-09T12:00:00.000Z",
  "updatedAt": "2016-05-09T12:00:00.000Z"
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| Not found | 404 | Object with id "id" is missing | There is no object with this `_id`. |

Example

```js
store.find(doc).then(function (doc) {
  alert(doc.id)
}).catch(function (error) {
  alert(error)
})
```

### store.find(idsOrDocs)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **`idsOrDocs`** | Array | Array of `id` (String) or `doc` (Object) items | Yes

Resolves with array of `properties`

```json
[{
  "id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "createdAt": "2016-05-09T12:00:00.000Z",
  "updatedAt": "2016-05-09T12:00:00.000Z"
}]
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| Not found | 404 | Object with id "id" is missing | There is no object with this `_id`. |

Example

```js
store.find(doc).then(function (doc) {
  alert(doc.id)
}).catch(function (error) {
  alert(error)
})
```

### store.findOrAdd(id, doc)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **id** | String | Unique `id` of document | Yes |
| **doc** | Object | document with `_id` property | Yes |

Resolves with the found document or creates a new document and returns it:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z"
  }
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| missing_id | 412 | _id is required for puts | `doc` needs to contain at least an `_id` property. |

Example

```js
store.findOrAdd(
  '12345678-1234-1234-1234-123456789ABC',
  { foo: 'bar' }
).then(function (doc) {
  alert(doc)
}).catch(function (error) {
  alert(error)
})
```

### store.findOrAdd(doc)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **doc** | Object | document with `_id` property | Yes |

Resolves with the found document or creates a new document and returns it:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z"
  }
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| missing_id | 412 | _id is required for puts | `doc` needs to contain at least an `_id` property. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.findOrAdd({
  _id: '12345678-1234-1234-1234-123456789ABC'
}).then(function (doc) {
  alert(doc)
}).catch(function (error) {
  alert(error)
})
```

### store.findOrAdd(idsOrDocs)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **idsOrDocs** | Array | Array of `doc` (Object) items | Yes |

Resolves with an Array containing all found and/or added documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z"
  }
}]
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| missing_id | 412 | _id is required for puts | `doc` needs to contain at least an `_id` property. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.findOrAdd([
  { _id: '12345678-1234-1234-1234-123456789ABC' }
]).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.findAll(filter)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **filter** | Function | Return only documents for which this function returns `true` | No |

Resolves with an Array containing all found documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z"
  }
}]
```

Rejects with:

findAll doesn't have expected errors. If nothing is found, then an empty array is resolved.

Example:

```js
store.findAll().then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

Example: with `filter` function

```js
function filterDocs(doc) {
  return doc.foo === 'bar'
}

store.findAll(filterDocs).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.update(id, properties)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **id** | String | The `id` of the document | Yes |
| **properties** | Object | Properties which should be changed or added if not existent | Yes |

Resolves with the updated document:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "updated-bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `properties` isn't an object. |
| Not found | 404 | Object with id "unknown" is missing | There is no object with this `_id`. |
| \- | \- | Must provide change | `properties` isn't an object or function. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.update(
  '12345678-1234-1234-1234-123456789ABC',
  { foo: 'updated-bar' }
).then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.update(id, updateFunction)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **id** | String | The `id` of the document | Yes |
| **updateFunction** | Function | A function which mutates the document | Yes |

Resolves with the updated document:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "updated-bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}
```

Rejects with:

| Name 	| Status | Description | Why |
| :-- | :-- | :-- | :-- |
| unauthorized | 401 | Name or password is incorrect. | This plugin wasn't unlocked yet. |
| bad_request | 400 | Document must be a JSON object | `updateFunction` isn't an object or function. |
| Not found | 404 | missing | There is no object with this `_id`. |
| \- | \- | Must provide change | `updateFunction` isn't an object or function. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
function updateFn(doc) {
  return Object.assign(doc, { foo: 'updated-bar' })
}

store.update(
  '12345678-1234-1234-1234-123456789ABC',
  updateFn
).then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.update(doc)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **doc** | Object | document with `_id` property | Yes |

Resolves with the updated document:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "updated-bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `doc` isn't an object with an `_id` field. |
| Not found | 404 | missing | There is no object with this `_id`. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.update({
  _id: '12345678-1234-1234-1234-123456789ABC',
  foo: 'updated-bar'
}).then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.update(arrayOfDocs)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **arrayOfDocs** | Array | Array of `doc` (Object) items | Yes

Resolves with an Array of updated documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "updated-bar",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | This element in the array isn't an object with an `_id` field. |
| Not found | 404 | missing | There is no object with this `_id`. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.update([
  { _id: '12345678-1234-1234-1234-123456789ABC', foo: 'updated-bar' },
  { _id: '87654321-4321-4321-4321-987654321DEF', bar: 'updated-foo' },
]).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.updateOrAdd(id, properties)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **id** | String | The `id` of the document | Yes |
| **properties** | Object | Properties which should be changed or added if not existent | Yes |

Resolves with the updated or, if not yet existing, added document:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `properties` isn't an object. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.updateOrAdd(
  '12345678-1234-1234-1234-123456789ABC',
  { foo: 'baz' }
).then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.updateOrAdd(doc)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **doc** | Object | document with `_id` property | Yes

Resolves with the updated or, if not yet existing, added document:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `properties` isn't an object. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.updateOrAdd({
  _id: '12345678-1234-1234-1234-123456789ABC',
  foo: 'baz'
}).then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.updateOrAdd(arrayOfDocs)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **arrayOfDocs** | Array | Array of `doc` (Object) items | Yes

Resolves with an Array of updated or, if not yet existing, added documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | This element in the array isn't an object with an `_id` field. |
| ValidationError | \- | Message you provided in `validate` | The object didn't pass your `validate` function |

Example

```js
store.updateOrAdd([
  { _id: '12345678-1234-1234-1234-123456789ABC', foo: 'updated-bar' },
  { _id: '87654321-4321-4321-4321-987654321DEF', bar: 'updated-foo' },
]).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.updateAll(changedProperties)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **changedProperties** | Object | Properties which should be changed or added if not existent | Yes

Resolves with an Array of all updated documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| \- | \- | Must provide object or function | `changedProperties` isn't an object or a function. |
| ValidationError | \- | Message you provided in `validate` | The updated object didn't pass your `validate` function |

Example

```js
store.updateAll({ foo: '_baz' }).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.updateAll(updateFunction)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **updateFunction** | Function | A function which will be called for every document to update | Yes |

Resolves with an Array of all updated documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| \- | \- | Must provide object or function | `updateFunction` isn't an object or a function. |
| ValidationError | \- | Message you provided in `validate` | The updated object didn't pass your `validate` function |

Example

```js
function updateFn(doc) {
  return Object.assign(doc, { foo: '_baz' })
}

store.updateAll(updateFn).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.remove(id)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **id** | String | The `id` of the document | Yes |

Resolves with the deleted document:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z",
    "deletedAt": "2017-07-23T12:00:00.000Z"
  },
  "_deleted": true
}
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| Not found | 404 | Object with id "unknown" is missing | There is no object with this `_id`. |
| ValidationError | \- | Message you provided in `validate` | The updated object didn't pass your `validate` function |

Example

```js
store.remove('12345678-1234-1234-1234-123456789ABC').then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.remove(doc)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **doc** | Object | A `doc` (Object) with `_id` property | Yes

Resolves with ``:

```json
{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z",
    "deletedAt": "2017-07-23T12:00:00.000Z"
  },
  "_deleted": true
}
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | `doc` isn't an object with an `_id` field. |
| Not found | 404 | missing | There is no object with this `_id`. |
| ValidationError | \- | Message you provided in `validate` | The updated object didn't pass your `validate` function |

Example

```js
store.remove({ _id: '12345678-1234-1234-1234-123456789ABC' }).then(function (doc) {
  alert(doc)
}).catch(function (err) {
  alert(err)
})
```

### store.remove(idsOrDocs)

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------
| **idsOrDocs** | Array | Array of `id` (String) or `doc` (Object) items | Yes

Resolves with an Array of all deleted documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z",
    "deletedAt": "2017-07-23T12:00:00.000Z"
  },
  "_deleted": true
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | That element of the array isn't an object with an `_id` field or a string. |
| Not found | 404 | missing | There is no object with this `_id`. |
| ValidationError | \- | Message you provided in `validate` | The updated object didn't pass your `validate` function |

Example

```js
store.remove([
  '12345678-1234-1234-1234-123456789ABC',
  '87654321-4321-4321-4321-987654321DEF'
]).then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.removeAll()

Resolves with an Array of all deleted documents:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z",
    "deletedAt": "2017-07-23T12:00:00.000Z"
  },
  "_deleted": true
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| ValidationError | \- | Message you provided in `validate` | The updated object didn't pass your `validate` function |

Example

```js
store.removeAll().then(function (docs) {
  alert(docs)
}).catch(function (err) {
  alert(err)
})
```

### store.pull()

Pulls one or multiple objects from remote to local database. If **idOrObjectOrObjects** is undefined, then all changes will be pulled.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| **idOrObjectOrObjects** | string or object or array | Docs that should be pulled from remote | No |

Resolves with `Array` of changed objects in **idOrObjectOrObjects** or all changed docs:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | That element of the array isn't an object with an `_id` field or a string. |
| unauthorized | 401 | Name or password is incorrect. | You don't have permission to access remote db |
| not_found | 404 | Database not found | The remote db doesn't exist. |

Example

```js
store.pull('critical_data').then(function (docs) {
  if (docs.length === 1) {
    // Doc 'critical_data' did change
  }
}).catch(function (error) {
  // do you have access to the db?
})
```

### store.push()

Pushes one or multiple objects from local to remote database. If **idOrObjectOrObjects** is undefined, then all changes will be pushed.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| **idOrObjectOrObjects** | string or object or array | Docs that should be pulled from remote | No |

Resolves with `Array` of pushed docs:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | That element of the array isn't an object with an `_id` field or a string. |
| unauthorized | 401 | Name or password is incorrect. | You don't have permission to access remote db |
| forbidden | 403 | Forbidden by design doc validate_doc_update function | A `validate_doc_update` in a design doc on the remote db did reject the update. More about [`validate_doc_update` at the CouchDB docs](https://docs.couchdb.org/en/stable/ddocs/ddocs.html#validate-document-update-functions "Documentation about Validate Document Update Functions in the CouchDB documentations.") |
| not_found | 404 | Database not found | The remote db doesn't exist. |

Example

```js
store.push(['booking_23499', { _id: 'foo' }]).then(function (docs) {
  docs.forEach(function (doc) {
    // handle that doc was pushed to remote
  })
}).catch(function (error) {
  // push couldn't be completed
})
```

### store.sync()

Syncs one or multiple objects between local and remote database. If **idOrObjectOrObjects** is undefined, then all changes will be synced.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| **idOrObjectOrObjects** | string or object or array | Docs that should be synced between local and remote database. | No |

Resolves with `Array` of synced objects:

```json
[{
  "_id": "12345678-1234-1234-1234-123456789ABC",
  "foo": "baz",
  "hoodie": {
    "createdAt": "2017-08-22T22:00:00.000Z",
    "updatedAt": "2017-07-23T10:00:00.000Z"
  }
}]
```

Rejects with:

| Name | Status | Description | Why |
| :-- | :-- | :-- | :-- |
| bad_request | 400 | Document must be a JSON object | That element of the array isn't an object with an `_id` field or a string. |
| unauthorized | 401 | Name or password is incorrect. | You don't have permission to access remote db |
| forbidden | 403 | Forbidden by design doc validate_doc_update function | A `validate_doc_update` in a design doc on the remote db did reject the update. More about [`validate_doc_update` at the CouchDB docs](https://docs.couchdb.org/en/stable/ddocs/ddocs.html#validate-document-update-functions "Documentation about Validate Document Update Functions in the CouchDB documentations.") |
| not_found | 404 | Database not found | The remote db doesn't exist. |

Example

```js
store.sync('foo').then(function (docs) {
  // 'foo' is now in sync with remote
}).catch(function (error) {
  // sync did fail.
})
```

### store.connect()

Connects local and remote database and starts an automatic sync process that keeps local and remote database in sync.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |

Resolves without a value. But it emits an [events](#events).

It doesn't Reject. All errors are events.

Example

```js
store.connect()
  .then(function () {
    // the store now syncs between local and remote.
  })
```

### store.disconnect()

Disconnects local and remote database and stops the automatic sync process. This does not include [`pull`](#storepull), [`push`](#storepush) and [`sync`](#storesync).

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |

Resolves without a value. But it emits an [events](#events).

It does not Reject.

Example

```js
store.disconnect()
  .then(function () {
    // the store stopped syncing.
  })
```

### store.isConnected()

Checks if database connection is open and working.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |

Returns `true` / `false`.

Example

```js
store.connect().then(function () {
  store.isConnected() // true - the local and remote databases are syncing

  return store.disconnect()
}).then(function () {
  store.isConnected() // false - the local and remote databases are not syncing
})
```

### store.isPersistent()

Checks if local database stores objects.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |

Returns `true` / `false`.
`true`: Data is stored on the users machine.
`false`: Data is not stored on the users machine. If a tab is closed all data is gone and must be pulled from the remote database.

Example

```js
store.isPersistent()
```

### store.reset()

Destroy the local database and creates a new one. All changes that are not synced to remote database will be lost!

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |

Resolves with no value.

Example

```js
store.remove('important_data')
  .then(function () {
    // destroy local database
    return store.reset()
  })
  .then(function () {
    // re download all data
    return store.pull()
  })
```

### store.on()

Add an event handler, to handel store [events](#events).

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| __event_name__ | string | Name of the event that should be listen to. [Possible events](#events). | Yes |
| __handler__ | function | Event handler function. | Yes |

Returns `store` API.

Example

```js
store
  .on('change', function (eventName, doc) {
    // handle doc update.
  })
  .on('disconnect', function () {
    // store did disconnect.
  })
  .on('error', function (error) {
    // handle sync error.
  })
```

### store.one()

Add an event handler, to handle one store [events](#events). This handler will be removed after one event.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| __event_name__ | string | Name of the event that should be listen to. [Possible events](#events). | Yes |
| __handler__ | function | Event handler function. | Yes |

Returns `store` API.

Example

```js
store.once('reset', function () {
  // store was reset.
})
```

### store.off()

Remove an event handler.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| __event_name__ | string | Name of the event. One of the possible [events](#events). | Yes |
| __handler__ | function | The event handler function that is listening. | Yes |

Returns `store` API.

Example

```js
var changeHandler = function (eventName, doc) {}
store.on('change', changeHandler)

account.once('signout', function () {
  store.off('change', changeHandler)
})
```

### store.withIdPrefix()

Get a subset API with all CRUD methods and events scoped to an id prefix.

| Argument | Type | Description | Required |
| :------- | :--- | :---------- | :------- |
| __id-prefix__ | string | ID-prefix that should implicitly be added to all objects ID. | Yes |

Returns subset of `store` API with `_id` property implicitly prefixed by passed string.

The subset is:

| Method | Change |
| :----- | :----- |
| __add__ | Add the prefix to the id. |
| __find__ | Find only objects that start with prefix. |
| __findOrAdd__ | Find only objects that start with prefix. Or add one with prefix. |
| __findAll__ | Find all objects that start with prefix. |
| __update__ | Only update objects with an id that starts with prefix |
| __updateOrAdd__ | Only update objects with an id that starts with prefix. If none exist it adds one with that prefix. |
| __updateAll__ | Updates all objects which have an id that starts with prefix. |
| __remove__ | Remove an object with an id that starts with prefix |
| __removeAll__ | Remove all objects which have an id that starts with prefix. |
| __on__ | Only allows object events (`change`, `add`, `update` and `remove`). Event handler is only called for objects which have an id that starts with prefix |
| __one__ | Only allows object events (`change`, `add`, `update` and `remove`). Event handler is only called for objects which have an id that starts with prefix |
| __off__ | Can only remove an event handler that was added to this instance of store subset. |
| __withIdPrefix__ | It extends the prefix. |

Example

```js
var prefixed = store.withIdPrefix('foo:')

prefixed.add({ _id: 'bar', value: 42 }) // will add the object with id 'foo:bar'
  .then(function (doc) {
    // update documents with id 'foo:other' and 'foo:bar'
    return prefixed.update(['other', 'foo:bar'], { other: 'baz' })
  })

// Finds all objects which id start with 'foo:'
prefixed.findAll().then(function (docs) {})

// Handle all changes to objects which id start with 'foo:'
prefixed.on('change', function (eventName, doc) {})

var moarPrefixed = prefixed.withIdPrefix('moarPrefix:') // prefix is now 'foo:moarPrefix:'
```

### Events

| Event | Description | Arguments |
| :---- | :---------- | :-------- |
| __add__ | An object was added (this can be local or remote database) | `object` that was added |
| __update__ | An object was updated (this can be local or remote database) | `object` that was updated |
| __remove__ | An object was removed (this can be local or remote database) | `object` that was removed |
| __change__ | An object was changed on local or remote database. A change an be an object was added, updated or removed. | `event-name` (__add__, __update__ or __remove__), `object` that was changed |
| __push__ | Objects where [pushed](#storepush) to remote. [sync](#storesync) also emits this event. | `pushed-objects`; An Array with all objects pushed to remote. |
| __pull__ | Objects where [pulled](#storepull) from remote. [sync](#storesync) also emits this event. | `pulled-objects`; An Array with all objects pulled from remote. |
| __connect__ | Local database was [connected](#storeconnect) to remote database. | No arguments |
| __disconnect__ | Local database was [disconnect](#storedisconnect) from remote database. | No arguments |
| __reset__ | The local database was [reset](#storereset). | No arguments |

## Testing

Local setup

```
git clone https://github.com/hoodiehq/hoodie-store-client.git
cd hoodie-store-client
npm install
```

In Node.js

Run all tests and validate JavaScript Code Style using [standard](https://www.npmjs.com/package/standard)

```
npm test
```

To run only the tests

```
npm run test:node
```

Run tests in browser

```
npm run test:browser:local
```

This will start a local server. All tests and coverage will be run at [http://localhost:8080/__zuul](http://localhost:8080/__zuul)

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie-dotfiles/blob/master/static/CONTRIBUTING.md).
If you want to hang out you can join #hoodie-pouch on our [Hoodie Community Slack](http://hood.ie/chat/).

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
