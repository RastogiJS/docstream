#!/usr/local/bin/node

// libraries
var liner = require("./lib/liner.js"),
  parser = require('./lib/parser.js');

// command-line parameters
var rs = process.stdin;
var os = process.stdout;

// pipe the input to the output, via transformation functions
rs.pipe(liner)                // turn each line of the file into a single string
  .pipe(parser)               // attempt to parse each line
  .pipe(os);                  // write the output to stdout



  
   