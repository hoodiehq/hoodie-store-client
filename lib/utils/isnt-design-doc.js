// Checks for a design doc, so we can filters out docs that shouldn't return in *All methods
module.exports = function isntDesignDoc (row) {
  return /^_design/.test(row.id) !== true
}
