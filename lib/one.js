module.exports = one

/**
 * adds a one time listener to an event
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
function one (state, eventName, handler) {
  state.emitter.once(eventName, handler)

  return state.api
}
