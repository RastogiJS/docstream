const stream = require('stream');

// this is a Node.js Stream transform function it accepts a line of data 
// it pushes data out. It expects a JSON.parseable string which parses into an entity.
// This is then turned into XML and passed back synchronously 
const transform = new stream.Transform( { objectMode: true } );
transform._transform = function (line, encoding, done) {
  const rline = line.replace(/,$/m,'');
  let retval = "";
  // parse the JSON and convert to XML
  try {
    let data = JSON.parse(rline);
    if(typeof data.doc == 'object') {
      retval = JSON.stringify(data.doc.name) + "\n"; 
    }
  } catch (e) {
  }

  this.push(retval);
  done()
};


module.exports = transform;
