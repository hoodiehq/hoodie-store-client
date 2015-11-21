# hoodie-client

> Hoodie’s front-end client for the browser

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-client.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-client)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-client/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-client?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-client.svg)](https://david-dm.org/hoodiehq/hoodie-client)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-client/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-client#info=devDependencies)

This is the hoodie client glue code that integrates the hoodie client core modules

## Example

```js
var Hoodie = require('hoodie-client')
var hoodie = new Hoodie(options)

hoodie.acount.signUp({
  username: 'pat@Example.com',
  password: 'secret'
}).then(function (accountAttributes) {
  hoodie.log.info('Signed up as %s', accountAttributes.username)
}).catch(function (error) {
  hoodie.log.error(error)
})
```

## API

- [Constructor](#constructor)
- [hoodie.id](#hoodieid)
- [hoodie.url](#hoodieurl)
- [hoodie.account](#hoodieaccount)
- [hoodie.store](#hoodiestore)
- [hoodie.task](#hoodietask)
- [hoodie.connectionStatus](#hoodieconnectionstatus)
- [hoodie.log](#hoodielog)
- [hoodie.request](#hoodierequest)
- [hoodie.plugin](#hoodieplugin)
- [hoodie.reset](#hoodiereset)
- [hoodie.on](#hoodieon)
- [hoodie.one](#hoodieone)
- [hoodie.off](#hoodieoff)
- [hoodie.trigger](#hoodietrigger)
- [Events](#events)

### Constructor

```js
hoodie = new Hoodie({
  // optional. set to hostname where Hoodie server runs, if your app runs on
  // a different host
  url: 'http://example.com',

  // optional: account options
  // https://github.com/hoodiehq/hoodie-client-account#constructor
  // options.url is always set to hoodie.url + '/account/api'
  account: {},

  // optional: store options
  // https://github.com/hoodiehq/hoodie-client-store#constructor
  // options.dbName is always set to hoodie.id
  // options.remote is always set to hoodie.url + '/store/api'
  store: {},

  // optional: task options
  // https://github.com/hoodiehq/hoodie-client-test#constructor
  // options.userId is always set to hoodie.id
  // options.remote is always set to hoodie.url + '/task/api'
  task: {},

  // optional: connectionStatus options
  // https://github.com/hoodiehq/hoodie-client-connection-status#constructor
  // options.url is always set to hoodie.url + '/connection-status/api'
  // options.method is always set to 'HEAD'
  connectionStatus: {},

  // optional: log options
  // https://github.com/hoodiehq/hoodie-client-log#constructor
  log: {}
})
```

### `hoodie.id`

Read-only, unique, persistent identifier for the current user. It gets generated
on first load, it does not depend on an user account

### `hoodie.url`

---

🐕 **TO BE DONE**: [#13](https://github.com/hoodiehq/hoodie-client/issues/13)

---

Read-only, full url to the hoodie server, e.g. `http://example.com/hoodie`

### `hoodie.account`

see [account API](https://github.com/hoodiehq/hoodie-client-account#api)

### `hoodie.store`

see [store API](https://github.com/hoodiehq/hoodie-client-store#api)

### `hoodie.task`

see [task API](https://github.com/hoodiehq/hoodie-client-account#api)

### `hoodie.connectionStatus`

see [connectionStatus API](https://github.com/hoodiehq/hoodie-client-connection-status#api)

---

🐕 **API DESIGN DISCUSSION IN PROGRESS**: [#6](https://github.com/hoodiehq/hoodie-client/issues/6)

---

### `hoodie.log`

see [log API](https://github.com/hoodiehq/hoodie-client-log#api)

### `hoodie.request`

---

🐕 **TO BE DONE**: [#9](https://github.com/hoodiehq/hoodie-client/issues/9)

---

Sends a request, returns a promise

```js
hoodie.request(options)
```

Examples

```js
// sends a GET request to hoodie.url + '/foo/api/bar'
hoodie.request('/foo/api/bar')
// sends a GET request to another host
hoodie.request('https://example.com/foo/bar')
// sends a PATCH request to /foo/api/bar
hoodie.request({
  method: 'PATCH',
  url: '/foo/api/bar',
  data: {
    foo: 'bar'
  }
})
```

### `hoodie.plugin`

---

🐕 **TO BE DONE**: [#2](https://github.com/hoodiehq/hoodie-client/issues/2)

---

Initialise hoodie plugin

```js
hoodie.plugin(objectOrfunction)
```

Examples

```js
hoodie.plugin({
  sayHi: function () { alert('hi') }
})
```

```js
hoodie.plugin(function (hoodie) {
  hoodie.sayHi = function () { alert('hi') }
})
```

### `hoodie.reset`

---

🐕 **TO BE DONE**: [#12](https://github.com/hoodiehq/hoodie-client/issues/12)

---

Reset hoodie client and emit `reset` events so plugins can reset as well.
Returns a promise

```js
hoodie.reset()
```

### `hoodie.on`


```js
hoodie.on(eventName, handler)
```

Example

```js
hoodie.on('account:signin', function (username) {
  alert('Hello there, ' + username)
})
```

### `hoodie.one`


```js
hoodie.one(eventName, handler)
```

Example

```js
hoodie.one('mycustomevent', function (options) {
  console.log('foo is %s', options.bar)
})
hoodie.trigger('mycustomevent', { foo: 'bar' })
hoodie.trigger('mycustomevent', { foo: 'baz' })
// logs "foo is bar"
// DOES NOT log "foo is baz"
```

### `hoodie.off`


Removes event handler that has been added before

```js
hoodie.off(eventName, handler)
```

Example

```js
hoodie.off('connectionstatus:disconnected', showNotification)
```

### `hoodie.trigger`


Trigger custom events

```js
hoodie.trigger(eventName[, option1, option2, ...])
```

Example

```js
hoodie.trigger('mycustomevent', { foo: 'bar' })
```

### Events

<table>
  <tr>
    <th align="left"><code>reset</code></th>
    <td>triggered when `hoodie.reset()` succeeded</td>
  </tr>
  <tr>
    <th align="left"><code>account:*</code></th>
    <td>events, see <a href="https://github.com/hoodiehq/hoodie-client-account#events">account events</a></td>
  </tr>
  <tr>
    <th align="left"><code>store:*</code></th>
    <td>events, see <a href="https://github.com/hoodiehq/hoodie-client-store#events">store events</a></td>
  </tr>
  <tr>
    <th align="left"><code>task:*</code></th>
    <td>events, see <a href="https://github.com/hoodiehq/hoodie-client-task#events">task events</a></td>
  </tr>
  <tr>
    <th align="left"><code>connectionStatus:*</code></th>
    <td>events, see <a href="https://github.com/hoodiehq/hoodie-client-connection-status#events">task events</a></td>
  </tr>
</table>

## Testing

Local setup

```
git clone git@github.com:hoodiehq/hoodie-client.git
cd hoodie-client
npm install
```

Run all tests

```
npm test
```

Run test from one file only

```
node tests/specs/id
```

## License

Apache 2.0
