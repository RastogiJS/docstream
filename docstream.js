const liner = require('./lib/liner.js')
const parser = require('./lib/parser.js')

const rs = process.stdin
const os = process.stdout

// pipe the input to the output, via transformation functions
rs.pipe(liner) // turn each line of the file into a single string
  .pipe(parser) // attempt to parse each line
  .pipe(os) // write the output to stdout
