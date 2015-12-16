module.exports = request

var nets = require('nets')

var Promise = require('lie')

function request (options) {
  options.encoding = undefined

  return new Promise(function (resolve, reject) {
    nets(options, function (error, response) {
      if (error) {
        return reject(error)
      }

      if (response.statusCode >= 400) {
        error = new Error('HTTP error ' + response.statusCode)
        error.name = 'RequestError'
        error.code = response.statusCode
        error.body = response.body
        return reject(error)
      }

      resolve(response)
    })
  })
}
