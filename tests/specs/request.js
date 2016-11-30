var simple = require('simple-mock')
var test = require('tape')

var Hoodie = require('../../index')

var request = require('../../lib/request')

var state = Object.freeze({
  url: 'http://example.com'
})

test('has "request" method', function (t) {
  t.plan(1)

  var hoodie = new Hoodie({url: 'http://localhost:1234/hoodie'})
  t.is(typeof hoodie.request, 'function', 'has method')
})

test('hoodie.request without state object', function (t) {
  t.plan(1)

  request()
    .then(t.fail.bind(t, 'must reject'))
    .catch(t.pass.bind(t, 'rejects with error'))
})

test('hoodie.request without options', function (t) {
  t.plan(1)

  request(state)
    .then(t.fail.bind(t, 'must reject'))
    .catch(t.pass.bind(t, 'rejects with error'))
})

test('hoodie.request(url)', function (t) {
  t.plan(1)

  var requestPath = '/foo/api/bar' // relative URL path

  var expectedURL = state.url + requestPath

  simple.mock(request.internals, 'request').resolveWith({
    body: 'response body'
  })

  request(state, requestPath)

    .then(function (response) {
      t.equal(request.internals.request.lastCall.args[0].url, expectedURL, 'composes URL from state and options if URL begins with /')
      simple.restore()
    })

    .catch(t.error)
})

test('hoodie.request({options})', function (t) {
  t.plan(2)

  var options = {
    url: 'http://foo.com/bar', // full URL
    method: 'POST',
    data: [1, 2, 3],
    headers: {foo: 'bar'}
  }

  simple.mock(request.internals, 'request').resolveWith({
    body: 'response body'
  })

  request(state, options)

    .then(function (response) {
      t.equal(request.internals.request.lastCall.args[0].url, options.url, 'passes URL unmodified when not beginning with /')
      t.deepEqual(request.internals.request.lastCall.arg, {
        url: options.url,
        method: options.method,
        body: JSON.stringify(options.data),
        headers: options.headers
      }, 'formats options for passing to `utils/request`')

      simple.restore()
    })

    .catch(t.error)
})

test('hoodie.request with Error', function (t) {
  t.plan(1)

  simple.mock(request.internals, 'request').rejectWith(new Error('Ooops'))

  request(state, {})

    .then(t.fail.bind(t, 'must reject'))

    .catch(function (error) {
      t.is(typeof error, 'object', 'returns error object')
      simple.restore()
    })
})
