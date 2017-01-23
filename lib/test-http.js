const req = require('req-fast')
const semver = require('semver')

const couchURL = process.env.NPM_URL || 'http://localhost:55590/registry'
// 'http://localhost:5984/registry' ||
const getVersions = (dep, range, cb) => req(`${couchURL}/_design/app/_view/allVersions?key="${dep}"`, function (err, resp) {
  if (err) {
    cb(err, null)
  }
  if (semver.validRange(range))
    cb(err, semver.maxSatisfying(resp.body.rows[0].value, range))
  else
    cb(err, null)
})

getVersions('express', '*', (err, res) => {
  console.log(res)
})
