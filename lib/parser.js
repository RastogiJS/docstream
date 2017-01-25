const stream = require('stream')

// this is a Node.js Stream transform function it accepts a line of data 
// it pushes data out. It expects a JSON.parseable string which parses into an entity.
// This is then turned into XML and passed back synchronously 
const transform = new stream.Transform({ objectMode: true })
transform._transform = function (line, encoding, done) {
  const raw = line.replace(/,$/m, '')
  let retval = {}
  // parse the JSON and convert to XML
  try {
    let data = JSON.parse(raw)
    if (typeof data.doc == 'object' && data.doc.versions) {
      Object.keys(data.doc.versions).forEach(ver => {
        const version = data.doc.versions[ver]
        const time = data.doc.time[ver] || ''
        const repotype = data.doc.repository && data.doc.repository.type ? data.doc.repository.type : ''
        const repourl = data.doc.repository && data.doc.repository.type ? data.doc.repository.url : ''
        if (version.dependencies) {
          Object.keys(version.dependencies).forEach(dep => {
            //  retval += `${data.doc.name}\t${time}\t${dep}\t${version.dependencies[dep]}\t${repotype}\t${repourl}\n`
            this.push(JSON.stringify({name: data.doc.name, version: ver, time, dep, range: version.dependencies[dep], type: repotype, url: repourl}))
          })
        }
      })
    }
  } catch (e) {}

  done()
}

module.exports = transform
