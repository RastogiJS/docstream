const cluster = require('cluster')
const restify = require('restify')
const plugins = require('restify-plugins')
const semver = require('semver')
const numCPUs = require('os').cpus().length
const req = require('req-fast')

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
  if (map.has(dep)) {
    const clean = map.get(dep)
    cb(null, semver.maxSatisfying(clean, range))
  } else {
    return getVersions(dep, range, cb)
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

  server.get('/resolve/:depname/:range', function (req, res, next) {
    console.log(req.params)
    getVersionsCache(req.params.depname, req.params.range, (err, version) => {
      console.log('Responded by worker #' + cluster.worker.id)
      res.json({resolved: version})
      return next()
    })
  })

  console.log('I am worker #' + cluster.worker.id)
  // All workers use this port
  server.listen(3605)
}
