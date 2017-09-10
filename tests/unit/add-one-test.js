var simple = require('simple-mock')
var test = require('tape')

var addOne = require('../../lib/helpers/add-one')

test('add-one non-409 error', function (t) {
  t.plan(1)

  var non409Error = new Error('not a 409 error')

  simple.mock(addOne.internals, 'put').rejectWith(non409Error)
  simple.mock(addOne.internals, 'addTimestamps')

  var state = {}

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an error')
  })

  .catch(function (error) {
    t.is(error, non409Error)

    simple.restore()
  })
})

test('add-one ValidationError', function (t) {
  t.plan(2)

  var state = {
    validate: function () { throw new Error('Validation failed for the given docs') }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'Validation failed for the given docs', 'error message matches intent')
  })
})

test('add-one validate rejects with Error (without message)', function (t) {
  t.plan(2)

  var state = {
    validate: function () { return Promise.reject(new Error()) }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'document validation failed', 'error message matches intent')
  })
})

test('add-one validate rejects with Error (with message)', function (t) {
  t.plan(2)

  var state = {
    validate: function () { return Promise.reject(new Error('Validation failed for the given docs')) }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'Validation failed for the given docs', 'error message matches intent')
  })
})

test('add-one validate rejects with a string', function (t) {
  t.plan(2)

  var state = {
    validate: function () { return Promise.reject('Validation failed for the given docs') }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'Validation failed for the given docs', 'error message matches intent')
  })
})

test('add-one validate rejects with a value I', function (t) {
  t.plan(3)

  var state = {
    validate: function () { return Promise.reject(false) }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'check error value for more details', 'error message matches intent')
    t.is(error.value, false, 'error.value is false')
  })
})

test('add-one validate rejects with a value II', function (t) {
  t.plan(3)

  var state = {
    validate: function () { return Promise.reject(1) }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'check error value for more details', 'error message matches intent')
    t.is(error.value, 1, 'error.value is 1')
  })
})

test('add-one validate rejects with a value III', function (t) {
  t.plan(4)

  var state = {
    validate: function () { return Promise.reject({ failure: true, tries: 1 }) }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'check error value for more details', 'error message matches intent')
    t.is(error.value.failure, true, 'error.value.failure is true')
    t.is(error.value.tries, 1, 'error.value.tries is 1')
  })
})

test('add-one validation fails with custom error', function (t) {
  t.plan(4)

  let customError = new Error('custom error message')

  customError.status = 401
  customError.errorCode = 'DB_401'

  var state = {
    validate: function () { throw customError }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'custom error message', 'error message matches intent')
    t.is(error.status, 401, 'error.status is 401')
    t.is(error.errorCode, 'DB_401', 'error.errorCode is DB_401')
  })
})

test('add-one validate rejects with a value III', function (t) {
  t.plan(4)

  var state = {
    validate: function () { return Promise.reject({ failure: true, tries: 1 }) }
  }

  var doc = {}
  addOne(state, doc)

  .then(function () {
    t.fail('should throw an ValidationError')
  })

  .catch(function (error) {
    t.is(error.name, 'ValidationError', 'validation error name matches')
    t.is(error.message, 'check error value for more details', 'error message matches intent')
    t.is(error.value.failure, true, 'error.value.failure is true')
    t.is(error.value.tries, 1, 'error.value.tries is 1')
  })
})
