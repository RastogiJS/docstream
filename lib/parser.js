var stream = require('stream');

// this is a Node.js Stream transform function it accepts a line of data 
// it pushes data out. It expects a JSON.parseable string which parses into an entity.
// This is then turned into XML and passed back synchronously 
var transform = new stream.Transform( { objectMode: true } );
transform._transform = function (line, encoding, done) {
  var line = line.replace(/,$/m,'');
  var retval = "";
  // parse the JSON and convert to XML
  try {
    var data = JSON.parse(line);
    if(typeof data.doc == 'object') {
      retval = JSON.stringify(data.doc) + "\n"; 
    }
  } catch (e) {
  }

  this.push( retval);
  done()
};


module.exports = transform;
