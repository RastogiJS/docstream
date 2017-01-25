const stream = require('stream')
const redis = require('redis')
const client = redis.createClient()

// this is a Node.js Stream transform function it accepts a line of data 
// it pushes data out. It expects a JSON.parseable string which parses into an entity.
// This is then turned into XML and passed back synchronously 
const transform = new stream.Transform({ objectMode: true })

transform._transform = function (doc, encoding, done) {
  client.lpush(['rastogi:dep', JSON.stringify(doc)], (err, reply) => {
    if (err)
      console.log(err)
    this.push(reply.toString() + '\n')
    done()
  })
}

module.exports = transform
