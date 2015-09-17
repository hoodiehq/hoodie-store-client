module.exports = typeFilter

function typeFilter (type, item) {
  return item.type ? item.type === type : false
}

