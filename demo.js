const {client} = require('tre-client')
const Tracks = require('.')
const Shell = require('tre-editor-shell')
const h = require('mutant/html-element')
const setStyle = require('module-styles')('tre-stylesheets-demo')
const Finder = require('tre-finder')
const Importer = require('tre-file-importer')
const {makePane, makeDivider, makeSplitPane} = require('tre-split-pane')
const Value = require('mutant/value')
const computed = require('mutant/computed')

require('brace/theme/twilight')

styles()

client( (err, ssb, config) => {
  if (err) return console.error(err)

  const importer = Importer(ssb, config)
  importer.use(require('./common'))
  
  const renderFinder = Finder(ssb, {
    importer,
    skipFirstLevel: true,
    details: (kv, ctx) => {
      return kv && kv.meta && kv.meta["prototype-chain"] ? h('i', '(has proto)') : []
    }
  })

  const renderShell = Shell(ssb, {
    save: (kv, cb) => {
      ssb.publish(kv.value.content, cb)
    }
  })

  const renderTrack = Tracks(ssb, {
    ace_theme: 'ace/theme/twilight'
  })

  const where = Value('editor')

  document.body.appendChild(h('.tre-texttracks-demo', [
    makeSplitPane({horiz: true}, [
      makePane('25%', [
        renderFinder(config.tre.branches.texttracks || config.tre.branches.root)
      ]),
      makeDivider(),
      makePane('70%', [
        h('.bar', [
          h('select', {
            'ev-change': e => {
              where.set(e.target.value)
            }
          }, [
            h('option', 'editor'),
            h('option', 'compact-editor'),
            h('option', 'stage'),
            h('option', 'thumbnail')
          ])
        ]),
        computed([where, renderFinder.primarySelectionObs], (where, kv) => {
          if (!kv) return []
          if (where !== 'editor' && where !== 'compact-editor') {
            return renderTrack(kv, {where})  
          }
          return renderShell(kv, {
            renderEditor: renderTrack,
            where
          })
        })
      ])
    ])
  ]))
})

function styles() {
  setStyle(`
    body, html, .tre-stylesheets-demo {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    body {
      --tre-selection-color: green;
      --tre-secondary-selection-color: yellow;
      font-family: sans-serif;
    }
    h1 {
      font-size: 18px;
    }
    .pane {
      background: #eee;
    }
    .tre-finder .summary select {
      font-size: 9pt;
      background: transparent;
      border: none;
      width: 50px;
    }
    .tre-finder summary {
      white-space: nowrap;
    }
    .tre-finder summary:focus {
      outline: 1px solid rgba(255,255,255,0.1);
    }
    .tre-texttrack-editor {
      max-width: 500px;
    }
  `)
}
