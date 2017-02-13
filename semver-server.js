const cluster = require('cluster')
const restify = require('restify')
const plugins = require('restify-plugins')
const semver = require('semver')
const numCPUs = require('os').cpus().length * 2
const req = require('req-fast')
const npa = require('npm-package-arg')

const couchURL = process.env.NPM_URL || 'http://localhost:55590/registry'

const map = new Map()

const getVersions = (dep, range, cb) => req(`${couchURL}/_design/app/_view/allVersions?key="${dep}"`, function (err, resp) {
  if (err) {
    cb(err, null)
  }
  if (!resp.body.error && semver.validRange(range) && resp.body.rows.length > 0) {
    const clean = resp.body.rows[0].value.filter(ver => semver.clean(ver))
    map.set(dep, clean)
    cb(null, semver.maxSatisfying(clean, range))
  } else
    cb(null, null)
})

const getVersionsCache = (dep, range, cb) => {
  const parsed = npa(dep).escapedName
  console.log(npa(dep))
  console.log(JSON.stringify(parsed))
  if (!parsed) {
    cb(null, null)
  }

  if (map.has(parsed)) {
    const clean = map.get(parsed)
    cb(null, semver.maxSatisfying(clean, range))
  } else {
    return getVersions(parsed, range, cb)
  }
}

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    // Create a worker
    cluster.fork()
  }
} else {
  // Workers share the TCP connection in this server
  const server = restify.createServer({
    name: 'semver-resolver',
    version: '1.0.0'
  })
  server.use(plugins.acceptParser(server.acceptable))
  server.use(plugins.queryParser())
  server.use(plugins.bodyParser())

  server.post('/resolve', function (req, res, next) {
    console.log(req.body)
    getVersionsCache(req.body.depname, req.body.range, (err, version) => {
      console.log('Responded by worker #' + cluster.worker.id)
      res.json({resolved: version})
      return next()
    })
  })

  console.log('I am worker #' + cluster.worker.id)
  // All workers use this port
  server.listen(3605)
}
