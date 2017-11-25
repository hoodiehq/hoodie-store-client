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

---

🐕 **Add expected Errors**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Name | Description  |
| :-- | :-- |
| Error | ... |

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

---

🐕 **Add expected Errors**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Name | Description  |
| :-- | :-- |
| Error | ... |

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

---

🐕 **Add expected Errors**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Name | Description  |
| :-- | :-- |
| Error | ... |

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

---

🐕 **Add expected Errors**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Name | Description  |
| :-- | :-- |
| Error | ... |

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

---

🐕 **Add expected Errors**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
store.find(doc).then(function (doc) {
  alert(doc.id)
}).catch(function (error) {
  alert(error)
})
```

### store.findOrAdd(id, doc)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.findOrAdd(doc)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.findOrAdd(idsOrDocs)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.findAll()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.update(id, changedProperties)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.update(id, updateFunction)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.update(doc)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.update(arrayOfDocs)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.updateOrAdd(id, doc)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.updateOrAdd(doc)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.updateOrAdd(arrayOfDocs)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.updateAll(changedProperties)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.updateAll(updateFunction)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.remove(id)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.remove(doc)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.remove(idsOrDocs)

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.removeAll()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.pull()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.push()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.sync()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.connect()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.disconnect()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Resolves with ``:

```json
{

}
```

Rejects with:

| Name | Description  |
| :-- | :-- |
| Error | ... |

Example

```js
```

### store.isConnected()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Returns `true` / `false`

Example

```js
```

### store.on()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Returns `store` API.

Example

```js
```

### store.one()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Returns `store` API.

Example

```js
```

### store.off()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Returns `store` API.

Example

```js
```

### store.withIdPrefix()

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Argument | Type | Description | Required
| :------- | :--- | :---------- | :-------

Returns subset of `store` API with `_id` property implicitly prefixed by passed string

Example

```js
```

### Events

---

🐕 **Complete README**: [#102](https://github.com/hoodiehq/hoodie-store-client/issues/102)

---

| Event | Description | Arguments
| :---- | :---------- | :--------

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
