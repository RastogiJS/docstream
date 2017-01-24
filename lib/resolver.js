const stream = require('stream')
const transform = new stream.Transform({ objectMode: true })
const req = require('req-fast')
const semver = require('semver')

const couchURL = process.env.NPM_URL || 'http://localhost:5984/registry' || 'http://localhost:55590/registry'
// 'http://localhost:5984/registry' ||
const getVersions = (dep, range, cb) => req(`${couchURL}/_design/app/_view/allVersions?key="${dep}"`, function (err, resp) {
  if (err) {
    cb(err, null)
  }
  console.log('\n\n')
  console.log(`${dep} ${range}`)
  console.log(JSON.stringify(resp))
  console.log('\n\n\n')
  if (resp != undefined && semver.validRange(range) && resp.body.rows.length > 0) {
    const clean = resp.body.rows[0].value.filter(ver => semver.clean(ver))
    console.log(JSON.stringify(resp))
    console.log('\n\n\n')
    cb(err, semver.maxSatisfying(clean, range))
  } else
    cb(err, null)
})

transform._transform = function (doc, encoding, done) {
  let retval = ''
  if (Object.keys(doc).length > 0) {
    if (semver.validRange(doc.range)) {
      getVersions(doc.dep, doc.range, (err, res) => {
        retval += `${doc.name}\t${doc.time}\t${doc.dep}\t${doc.range}\t${res}\t${doc.type}\t${doc.url}\n`
        this.push(retval)
        done()
      })
    } else {
      retval += `${doc.name}\t${doc.time}\t${doc.dep}\t${doc.range}\t${null}\t${doc.type}\t${doc.url}\n`
      this.push(retval)
      done()
    }
  } else {
    done()
  }
}

module.exports = transform
