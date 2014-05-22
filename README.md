# DocStream 


## Installation

This utility requires Node.js and can be installed via the "npm" utility

```
sudo npm install -g docstream
```

After that, the "docstream" command should be available at the command-line

## Introduction

CouchDB's "_all_docs" endpoint gets you all the documents in database in this form

e.g

  http://mycouchdbserver?_all_docs?include_docs=true_

```
{
    "total_rows": 93985131,
    "offset": 0,
    "rows": [
        {
            "id": "0000230a35e724e12b8c18a8f700065d",
            "key": "0000230a35e724e12b8c18a8f700065d",
            "value": {
                "rev": "1-adf8311047fcdd953543118e7d501fa1"
            },
            "doc": {
                "_id": "0000230a35e724e12b8c18a8f700065d",
                "_rev": "1-adf8311047fcdd953543118e7d501fa1",
                "a": "1",
                "b": "2",
                "c": "3"
            }
        },
        {
            "id": "0000230a35e724e12b8c18a8f7000ccd",
            "key": "0000230a35e724e12b8c18a8f7000ccd",
            "value": {
                "rev": "1-5ce610ff79bc1cfe62b4a1a68e5b09cf"
            },
            "doc": {
                "_id": "0000230a35e724e12b8c18a8f7000ccd",
                "_rev": "1-5ce610ff79bc1cfe62b4a1a68e5b09cf",
                "a": "2",
                "b": "5",
                "c": "6"
            }
        }
    ]
}
```

Notice the documents themselves are contained inside an object inside an array. In real life, the data comes out like this:

```
{"total_rows":93985131,"offset":0,"rows":[
{"id":"0000230a35e724e12b8c18a8f700065d","key":"0000230a35e724e12b8c18a8f700065d","value":{"rev":"1-adf8311047fcdd953543118e7d501fa1"},"doc":{"_id":"0000230a35e724e12b8c18a8f700065d","_rev":"1-adf8311047fcdd953543118e7d501fa1","a":"1","b":"2","c":"3"}},
{"id":"0000230a35e724e12b8c18a8f7000ccd","key":"0000230a35e724e12b8c18a8f7000ccd","value":{"rev":"1-5ce610ff79bc1cfe62b4a1a68e5b09cf"},"doc":{"_id":"0000230a35e724e12b8c18a8f7000ccd","_rev":"1-5ce610ff79bc1cfe62b4a1a68e5b09cf","a":"2","b":"5","c":"6"}}
]}

```
with each object on its own line.

If you are wanting to export the data and put it in Redshift, for example, the JSON needs to be in this form:

```
{"_id":"0000230a35e724e12b8c18a8f700065d","_rev":"1-adf8311047fcdd953543118e7d501fa1","a":"1","b":"2","c":"3"}
{"_id":"0000230a35e724e12b8c18a8f7000ccd","_rev":"1-5ce610ff79bc1cfe62b4a1a68e5b09cf","a":"2","b":"5","c":"6"}
```

### Solution 1 - jq

The jq utility allows JSON to be parsed and reformatted on the command-line. e.g. 

```
  curl 'http://mycouchdbserver?_all_docs?include_docs=true' | jq '.rows[].doc'
```

(Thanks to Cloudant Support for this solution). Unfortunately it is not suitable for large data sets as jq requires all of the data to be in-memory.

### Solution 2 - Use this docstream.js utility

DocStream takes _all_docs data in on stdin and outputs just the "doc" section:

```
  curl 'http://mycouchdbserver?_all_docs?include_docs=true' | docstream
```

This is should work with any size of data set, as long as each document appears per line.

e.g.

```
 cat sample.txt | docstream | gzip > output.txt.gz
```
