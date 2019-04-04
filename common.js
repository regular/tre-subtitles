const pull = require('pull-stream')
const BufferList = require('bl')

module.exports = {
  importFiles,
  factory
}

function importFiles(ssb, files, opts, cb) {
  opts = opts || {}
  const prototypes = opts.prototypes || {}
  if (!prototypes) return cb(new Error('no prototypes'))
  if (files.length>1) return cb(true) // we don't do multiple files
  const file = files[0]
  const fileProps = getFileProps(file)

  if (file.type !== 'text/vtt' && !file.name.endsWith('.vtt')) return cb(true)
  const bl = BufferList()
  pull(
    file.source(),
    pull.drain( buffer => bl.append(buffer), err  => {
      if (err) return cb(err)
      const text = bl.toString()
      const name = titleize(file.name)
      const content = {
        type: 'texttrack',
        prototype: prototypes.texttrack,
        name,
        file: fileProps,
        text
      }
      return cb(null, content)
    })
  )
}

function titleize(filename) {
  return filename.replace(/\.\w{3,4}$/, '').replace(/-/g, ' ')
}

function factory(config) {
  const type = 'texttrack'
  return {
    type,
    i18n: {
      'en': 'Text Track'
    },
    prototype: function() {
      return {
        type,
        kind: 'subtitles',
        text: '',
        schema: {
          description: 'An additional subtitle, caption or metadata track for audio or video files',
          type: 'object',
          required: ['type', 'text', 'kind'],
          properties: {
            type: { "const": type },
            text: { type: 'string' },
            kind: {
              type: 'string',
              'enum': [ 'subtitles', 'captions', 'descriptions', 'chapters', 'metadata' ]
            },
            language: {
              type: 'string',
              pattern: "^[a-z]{2}$"
            },
          }
        }
      }
    },
    content: function() {
      return {
        type,
        prototype: config.tre.prototypes[type]
      }
    }
  }
}
// -- utils

function getFileProps(file) {
  // Object.assign does not work with file objects
  return {
    lastModified: file.lastModified,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}
