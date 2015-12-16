module.exports = request

var Promise = require('lie')

var internals = module.exports.internals = {}
internals.request = require('./utils/request')

function request (state, options) {
  if (!state) {
    return Promise.reject(new Error('hoodie.request: state must be defined'))
  }
  if (!options) {
    return Promise.reject(new Error('hoodie.request: URL or options argument must be defined'))
  }

  var requestOptions = {
    url: options.url || options
  }

  if ((/^\/([^\/]|$)/).test(requestOptions.url)) {
    requestOptions.url = state.url + requestOptions.url
  }

  if (options.data) {
    requestOptions.body = JSON.stringify(options.data)
  }

  requestOptions.method = options.method
  requestOptions.headers = options.headers

  return internals.request(requestOptions)
}
