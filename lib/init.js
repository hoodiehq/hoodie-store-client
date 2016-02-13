module.exports = init

function init (hoodie) {
  var account = hoodie.account
  var store = hoodie.store

  // glue code
  account.on('signout', function () {
    // TODO: prevent data loss on sign out:
    //       https://github.com/hoodiehq/hoodie-client/issues/22
    store.reset({ name: hoodie.account.id })
  })

  account.on('signin', function () {
    store
      .reset({ name: hoodie.account.id })
      .then(store.connect)
  })

  if (account.isSignedIn()) {
    store.connect()
  }
}
