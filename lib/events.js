module.exports = {
  on: on,
  one: one,
  off: off,
  trigger: trigger
}

/**
 * add a listener to an event
 *
 * @param  {String} eventName   Name of event
 * @param  {Function} handler   callback for event
 */
function on (state, eventName, handler) {
  state.emitter.on(eventName, handler)

  return this
}

/**
 * adds a one time listener to an event
 *
 * @param  {String} eventName   Name of event
 * @param  {Function} handler   callback for event
 */
function one (state, eventName, handler) {
  state.emitter.once(eventName, handler)

  return this
}

/**
 * removes a listener for the specified event
 *
 * It will unsubscribe at most, one instance of a listener for a particular event.
 * If any single listener has subcribed multiple times to the same event,
 * then `off` must be called multiple times.
 *
 * @param  {String} eventName   Name of event
 * @param  {Function} handler   callback for event
 */
function off (state, eventName, handler) {
  state.emitter.removeListener(eventName, handler)

  return this
}

/**
 * trigger a specified event
 *
 * @param  {String} eventName   Name of event
 */
function trigger (state, eventName) {
  state.emitter.emit(eventName)

  return this
}
