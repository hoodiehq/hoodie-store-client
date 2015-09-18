# hoodie-client

> Hoodie Client Core

This is the hoodie client glue code that initialises the hoodie client core
including [store](https://github.com/hoodiehq/pouchdb-hoodie-store),
[account](https://github.com/hoodiehq/account-client), and
[task](https://github.com/hoodiehq/task-client)

`hoodie-client` exports a constructor that gets initialised in `hoodie-server`

```js
var Hoodie = require('hoodie-client')
global.hoodie = new Hoodie()
```

## Core client APIs

- `hoodie.id()`  
   Returns a unique, persistent identifier for the current user.
- `hoodie.on()`  
   Adds an event handler for the specified events
- `hoodie.one()`  
   Binds a one-time event handler to the specified event. Once the event has
   been caught, the listener will be unbound automatically.
- `hoodie.off()`
   Unbind event handlers from a certain event.
- `hoodie.trigger()`  
   Triggers a certain event. This includes both custom and predefined events.
- `hoodie.checkConnection()`  
   Sends request to the Hoodie Server to check if it is reachable
- `hoodie.isConnected()`  
   Returns true if Hoodie backend can currently be reached, otherwise false
- `hoodie.request(type, url/*, options/*)`  
   Sends a request
- `hoodie.reset()`  
   Reset hoodie client and emit `reset` events so plugins can reset as well
- `hoodie.plugin(function (hoodie) {})`  
   Initialise hoodie plugin

_to be defined_

- `hoodie.log(message)`
- `hoodie.log.info(message)`
- `hoodie.log.warn(message)`
- `hoodie.log.error(message)`

Also compare docs of old hoodie client API, it's mostly the same:
http://docs.hood.ie/en/techdocs/api/client/hoodie.html

### Testing

```
npm test
```

### License

Apache 2.0