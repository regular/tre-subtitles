const test = require('tape')
const {importFiles} = require('../common')
const pull = require('pull-stream')

const TYPE = 'texttrack'

test('importFiles', t => {

  const ssb = {}
  const file = {
    name: 'a-file-name.vtt',
    size: 20,
    type: 'text/vtt'
  }
  file.source = () => pull.values(['Hello', 'World'])

  const opts = {
    prototypes: {
      [TYPE]: 'foo'
    }
  }

  importFiles(ssb, [file], opts, (err, result) => {
    console.log(result)
    t.equal(result.type, TYPE, 'has correct type')
    t.equal(result.prototype, 'foo', 'has correct prototype')
    t.equal(result.file.name, file.name, 'has file name')
    t.equal(result.file.size, file.size, 'has file size')
    t.equal(result.file.type, file.type, 'has file type')
    t.ok(result.name, 'has a name')
    t.equal(result.text, 'HelloWorld', 'has text content')
    t.end()
  })
})
