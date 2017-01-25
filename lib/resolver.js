const semver = require('semver')
const request = require('requestretry')
const through2Concurrent = require('through2-concurrent')

module.exports = through2Concurrent.obj(
  {maxConcurrency: 100},
  function (doc, encdoing, done) {
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
  })
