# hoodie-client

> Hoodie’s client for the browser

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-client.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-client)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-client/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-client?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-client.svg)](https://david-dm.org/hoodiehq/hoodie-client)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-client/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-client#info=devDependencies)

Hoodie’s client glue code that integrates Hoodie’s client core modules: [account](https://github.com/hoodiehq/hoodie-client-account), [store](https://github.com/hoodiehq/hoodie-client-store) and [task](https://github.com/hoodiehq/hoodie-client-task)

## Example

```js
var Hoodie = require('hoodie-client')
var hoodie = new Hoodie(options)

hoodie.account.signUp({
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
new Hoodie(options)
```

<table>
  <thead>
    <tr>
      <th align="left">Argument</th>
      <th align="left">Type</th>
      <th align="left">Description</th>
      <th align="left">Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left">options.url</th>
    <td>String</td>
    <td>
      Set to hostname where Hoodie server runs, if your app runs on
      a different host
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.account</th>
    <td>String</td>
    <td>
      <a href="https://github.com/hoodiehq/hoodie-client-account#constructor">account options</a>.
      <code>options.url</code> is always set to <code>hoodie.url</code> + '/account/api'
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.store</th>
    <td>String</td>
    <td>
      <a href="https://github.com/hoodiehq/hoodie-client-store#constructor">store options</a>.
      <code>options.dbName</code> is always set to <code>hoodie.account.id</code>.
      <code>options.remote</code> is always set to <code>hoodie.url</code> + '/store/api'
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.task</th>
    <td>String</td>
    <td>
      <a href="https://github.com/hoodiehq/hoodie-client-task#constructor">task options</a>.
      <code>options.userId</code> is always set to <code>hoodie.account.id</code>.
      <code>options.remote</code> is always set to <code>hoodie.url</code> + '/task/api'
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.connectionStatus</th>
    <td>String</td>
    <td>
      <a href="https://github.com/hoodiehq/hoodie-client-connection-status#constructor">connectionStatus options</a>.
      <code>options.url</code> is always set to <code>hoodie.url</code> + '/connection-status/api'.
      <code>options.method</code> is always set to <code>HEAD</code>
    </td>
    <td>No</td>
  </tr>
</table>

### hoodie.url

_Read-only_

```js
hoodie.url
```

full url to the hoodie server, e.g. `http://example.com/hoodie`

### hoodie.account

`hoodie.account` is an instance of [hoodie-client-account](https://github.com/hoodiehq/hoodie-client-account).
See [account API](https://github.com/hoodiehq/hoodie-client-account#api)

### hoodie.store

`hoodie.store` is an instance of [hoodie-client-store](https://github.com/hoodiehq/hoodie-client-store).
See [store API](https://github.com/hoodiehq/hoodie-client-store#api)

### hoodie.task

`hoodie.task` is an instance of [hoodie-client-task](https://github.com/hoodiehq/hoodie-client-task).
See [task API](https://github.com/hoodiehq/hoodie-client-task#api)

### hoodie.connectionStatus

`hoodie.connectionStatus` is an instance of [hoodie-client-connection-status](https://github.com/hoodiehq/hoodie-client-connection-status).
See [connectionStatus API](https://github.com/hoodiehq/hoodie-client-connection-status#api)

### hoodie.log

`hoodie.log` is an instance of [hoodie-client-log](https://github.com/hoodiehq/hoodie-client-log).
See [log API](https://github.com/hoodiehq/hoodie-client-log#api)

### hoodie.request

Sends an http request

```js
hoodie.request(url)
// or
hoodie.request(options)
```

<table>
  <thead>
    <tr>
      <th align="left">Argument</th>
      <th align="left">Type</th>
      <th align="left">Description</th>
      <th align="left">Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left">url</th>
    <td>String</td>
    <td>
      Relative path or full URL. A path must start with <code>/</code> and sends a <code>GET</code>
      request to the path, prefixed by <code>hoodie.url</code>. In case a full URL is passed,
      a <code>GET</code> request to the url is sent.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left">options.url</th>
    <td>String</td>
    <td>
      Relative path or full URL. A path must start with <code>/</code> and sends a <code>GET</code>
      request to the path, prefixed by <code>hoodie.url</code>. In case a full URL is passed,
      a <code>GET</code> request to the url is sent.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left">options.method</th>
    <td>String</td>
    <td>
      <em>Defaults to <code>GET</code></em>. One of <code>GET</code>,
      <code>HEAD</code>, <code>POST</code>, <code>PUT</code>, <code>DELETE</code>.
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.data</th>
    <td>Object, Array, String or Number</td>
    <td>
      For <code>PUT</code> and <code>POST</code> requests, an optional payload
      can be sent. It will be stringified before sending the request.
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.headers</th>
    <td>Object</td>
    <td>
      Map of Headers to be sent with the request.
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left">options.data</th>
    <td>Object, Array, String or Number</td>
    <td>
      For <code>PUT</code> and <code>POST</code> requests, an optional payload
      can be sent. It will be stringified before sending the request.
    </td>
    <td>No</td>
  </tr>
</table>

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
  headers: {
    'x-my-header': 'my value'
  },
  data: {
    foo: 'bar'
  }
})
```

### hoodie.plugin

Initialise hoodie plugin

```js
hoodie.plugin(methods)
hoodie.plugin(plugin)
```

<table>
  <thead>
    <tr>
      <th align="left">Argument</th>
      <th align="left">Type</th>
      <th align="left">Description</th>
      <th align="left">Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left">methods</th>
    <td>Object</td>
    <td>
      Method names as keys, functions as values. Methods get directly set on
      <code>hoodie</code>, e.g. <code>hoodie.plugin({foo: function () {}})</code>
      sets <code>hoodie.foo</code> to <code>function () {}</code>
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left">plugin</th>
    <td>Function</td>
    <td>
      The passed function gets called with `hoodie` as first argument, and
      can directly set new methods / properties on it.
    </td>
    <td>Yes</td>
  </tr>
</table>

Examples

```js
hoodie.plugin({
  sayHi: function () { alert('hi') }
})
hoodie.plugin(function (hoodie) {
  hoodie.sayHi = function () { alert('hi') }
})
```

### hoodie.reset

---

🐕 **TO BE DONE**: [#12](https://github.com/hoodiehq/hoodie-client/issues/12)

---

Reset hoodie client and emit `reset` event so plugins can reset as well.

```js
hoodie.reset()
```

Resolves without argument.

### hoodie.on

Subscribe to event.

```js
hoodie.on(eventName, handler)
```

Example

```js
hoodie.on('account:signin', function (accountProperties) {
  alert('Hello there, ' + accountProperties.username)
})
```

### hoodie.one

Call function once at given event.

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

### hoodie.off


Removes event handler that has been added before

```js
hoodie.off(eventName, handler)
```

Example

```js
hoodie.off('connectionstatus:disconnect', showNotification)
```

### hoodie.trigger


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
    <td>triggered when <code>hoodie.reset()</code> succeeded</td>
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
    <td>events, see <a href="https://github.com/hoodiehq/hoodie-client-connection-status#events">connectionStatus events</a></td>
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

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
