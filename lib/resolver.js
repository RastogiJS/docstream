const stream = require('stream')
const transform = new stream.Transform({ objectMode: true })
const semver = require('semver')
const request = require('requestretry')

const couchURL = process.env.NPM_URL || 'http://localhost:5984/registry' || 'http://localhost:55590/registry'
// 'http://localhost:5984/registry' ||

const getVersions = (dep, range, cb) => request({
  url: `${couchURL}/_design/app/_view/allVersions?key="${dep}"`,
  json: true,
  maxAttempts: 5, // (default) try 5 times
  retryDelay: 5000, // (default) wait for 5s before trying again
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
}, function (err, response, body) {
  if (err) {
    cb(err, null)
  }
  if (!body.error && semver.validRange(range) && body.rows.length > 0) {
    const clean = body.rows[0].value.filter(ver => semver.clean(ver))
    map.set(dep, clean)
    cb(null, semver.maxSatisfying(clean, range))
  } else
    cb(null, null)
})

var map = new Map()

const getVersions2 = (dep, range, cb) => {

  if (map.has(dep)) {
    console.log('<----exist----->')
    const clean = map.get(dep)
    cb(null, semver.maxSatisfying(clean, range))
  } else {
    console.log('<---- not exist----->')
    return getVersions(dep, range, cb)
  }
}

transform._transform = function (doc, encoding, done) {
  let retval = ''
  if (semver.validRange(doc.range)) {
    getVersions2(doc.dep, doc.range, (err, res) => {
      if (err) {
        retval += `${doc.name}\t${doc.version}\t${doc.time}\t${doc.dep}\t${doc.range}\t${null}\t${doc.type}\t${doc.url}\n`
        this.push(retval)
        done()
      } else {
        retval += `${doc.name}\t${doc.version}\t${doc.time}\t${doc.dep}\t${doc.range}\t${res}\t${doc.type}\t${doc.url}\n`
        this.push(retval)
        done()
      }
    })
  } else {
    retval += `${doc.name}\t${doc.version}\t${doc.time}\t${doc.dep}\t${doc.range}\t${null}\t${doc.type}\t${doc.url}\n`
    this.push(retval)
    done()
  }
}

module.exports = transform
