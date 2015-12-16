var simple = require('simple-mock')
var test = require('tape')
var proxyquire = require('proxyquire')

var nets = simple.stub()

var request = proxyquire('../../lib/utils/request', {
  nets: nets
})

test('libs/util/request with error', function (t) {
  t.plan(1)

  var response = {
    statusCode: 400,
    body: 'foo'
  }

  nets.callbackAtIndex(1, {}, response)

  request({})

    .then(t.fail.bind(t, 'must reject'))

    .catch(function (error) {
      t.is(typeof error, 'object', 'pass original error')

      simple.restore()
    })
})

test('libs/util/request with HTTP status < 400', function (t) {
  t.plan(3)

  var options = {
    url: '/foo/bar'
  }

  var response = {
    statusCode: 200,
    body: 'foo'
  }

  nets.callbackAtIndex(1, null, response)

  request(options)

    .then(function (r) {
      t.deepEqual(nets.lastCall.arg, options)
      t.is(typeof response, 'object', 'returns response object')
      t.deepEqual(r, response)

      simple.restore()
    })
})

test('libs/util/request with HTTP status >= 400', function (t) {
  t.plan(4)

  var response = {
    statusCode: 400,
    body: 'foo'
  }

  nets.callbackAtIndex(1, null, response)

  request({url: '/foo/bar'})

    .then(t.fail.bind(t, 'must reject'))

    .catch(function (error) {
      t.is(typeof error, 'object', 'returns error object')
      t.deepEqual(error.code, response.statusCode, 'passes HTTP status code as error.code')
      t.deepEqual(error.name, 'RequestError', 'passes error.name')
      t.deepEqual(error.body, response.body, 'passes error.body')

      simple.restore()
    })
})
