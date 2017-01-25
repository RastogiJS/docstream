const liner = require('./lib/liner')
const parser = require('./lib/parser')
const resolver = require('./lib/resolver')
const redis = require('./lib/redis')

const rs = process.stdin
const os = process.stdout

// pipe the input to the output, via transformation functions
rs.pipe(liner) // turn each line of the file into a single string
  .pipe(parser) // attempt to parse each line
  .pipe(redis) //resolve all dependencies for each version of a document
  .pipe(os) // write the output to stdout
