const stream = require('stream')
const transform = new stream.Transform({ objectMode: true })
const semver = require('semver')
const request = require('requestretry')


const resolve = (dep, range, cb) => request({
  url: `http://localhost:3605/resolve/${dep}/${range}`,
  json: true,
  maxAttempts: 5, // (default) try 5 times
  retryDelay: 5000, // (default) wait for 5s before trying again
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
}, function (err, response, body) {
  if (err)
    cb(err, null)

  cb(null, body.resolved)
})

transform._transform = function (doc, encoding, done) {
  let retval = ''
  if (semver.validRange(doc.range)) {
    resolve(doc.dep, doc.range, (err, res) => {
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
