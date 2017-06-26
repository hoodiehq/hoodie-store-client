module.exports = on

/**
 * add a listener to an event
 *
 * Supported events:
 *
 * - `add`    → (doc)
 * - `update` → (doc)
 * - `remove` → (doc)
 * - `change` → (eventName, doc)
 *
 * @param  {String} eventName   Name of event, one of listed above
 * @param  {Function} handler   callback for event
 */
function on (state, eventName, handler) {
  state.emitter.on(eventName, handler)

  return state.api
}
