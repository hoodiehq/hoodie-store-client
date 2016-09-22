module.exports = init

function init (hoodie) {
  // In order to prevent data loss, we want to move all data that has been
  // created without an account (e.g. while offline) to the user’s account
  // on signin. So before the signin happens, we temporarily store it in
  // a variable (dataFromAccountBeforeSignin) and add it to the store again
  // in the post:signin hook below
  var dataFromAccountBeforeSignin
  var accountIdBeforeSignIn
  hoodie.account.on('pre:signin', function (options) {
    options.hooks.push(function () {
      accountIdBeforeSignIn = hoodie.account.id
      return hoodie.store.findAll().then(function (objects) {
        dataFromAccountBeforeSignin = objects
      })
    })
  })

  hoodie.account.on('post:signin', function (options) {
    options.hooks.push(function () {
      // when signing in to a newly created account, the account.id
      // does not change, so there is no need to clear the local
      // store and to migrate data
      if (accountIdBeforeSignIn === hoodie.account.id) {
        dataFromAccountBeforeSignin = null
        return hoodie.store.connect()
      }

      return hoodie.store.reset({ name: 'user/' + hoodie.account.id })

      .catch(function (error) {
        dataFromAccountBeforeSignin = null
        throw error
      })

      .then(function () {
        var migratedDataFromAccountBeforeSignIn = dataFromAccountBeforeSignin.map(function (object) {
          object.createdBy = hoodie.account.id
          delete object._rev
          return object
        })
        dataFromAccountBeforeSignin = null
        return hoodie.store.add(migratedDataFromAccountBeforeSignIn)
      })

      .then(function () {
        return hoodie.store.connect()
      })
    })
  })

  // see https://github.com/hoodiehq/hoodie-client-account/issues/65
  // for info on the internal pre:* & post:* events
  hoodie.account.on('pre:signout', function (options) {
    options.hooks.push(function () {
      return hoodie.store.push()
      .catch(function (error) {
        if (error.status !== 401) {
          throw error
        }

        error.message = 'Local changes could not be synced, sign in first'
        throw error
      })
    })
  })
  hoodie.account.on('post:signout', function (options) {
    options.hooks.push(function () {
      return hoodie.store.reset({ name: 'user/' + hoodie.account.id })
    })
  })

  hoodie.account.on('unauthenticate', hoodie.store.disconnect)
  hoodie.account.on('reauthenticate', hoodie.store.connect)

  // handle connection status changes
  hoodie.connectionStatus.on('disconnect', function () {
    if (!hoodie.account.isSignedIn()) {
      return
    }
    hoodie.store.disconnect()
  })
  hoodie.connectionStatus.on('connect', function () {
    if (!hoodie.account.isSignedIn()) {
      return
    }
    hoodie.store.connect()
  })

  // hoodie.connectionStatus.ok is false if there is a connection issue
  if (hoodie.account.isSignedIn() && hoodie.connectionStatus.ok !== false) {
    hoodie.store.connect()
  }
}
