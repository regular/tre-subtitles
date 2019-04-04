const h = require('mutant/html-element')
const Value = require('mutant/value')
const computed = require('mutant/computed')
const watch = require('mutant/watch')
const setStyle = require('module-styles')('tre-texttracks')
const Str = require('tre-string')
const ace = require('brace')
const {importFiles, factory} = require('./common')
const dataURI = require('./datauri')

// Does not exist
//require('brace/mode/vtt')

const MIMETYPE = 'text/vtt'

setStyle(`
  .tre-texttrack-editor pre.editor {
    width: 90%;
    min-height: 200px;
  }
`)

module.exports = function(ssb, opts) {
  opts = opts || {}

  return function render(kv, ctx) {
    ctx = ctx || {}
    const isDefault = ctx.default || false
    const content = kv && kv.value && kv.value.content
    if (content.type !== 'texttrack') return

    const contentObs = ctx.contentObs || Value({})

    const previewObs = ctx.previewObs || Value(kv)
    const previewContentObs = computed(previewObs, kv => kv && kv.value.content || computed.NO_CHANGE)
    const textObs = computed(previewContentObs, content => content.text || '')

    if (ctx.where == 'thumbnail' || ctx.where == 'tile') {
      return h('pre', 'texttrack')
    } else if (ctx.where == 'editor' || ctx.where == 'compact-editor') {
      return renderEditor()
    }
    return renderTrack()

    function renderTrack() {
      return computed(previewContentObs, c => {
        return h('track', {
          attributes: {
            'data-key': kv.key,
            'default': isDefault,
            label: c.name || '[no name]',
            kind: c.kind || 'subtitles',
            srclang: c.language || 'en',
            src: dataURI(c.text, MIMETYPE)
          }
        })
      })
    }

    function renderEditor() {
      const nameObs = computed(previewObs, kv => kv && kv.value.content.name)

      const syntaxErrorObs = ctx.syntaxErrorObs || Value()
      const contentLengthObs = computed(contentObs, c => JSON.stringify(c).length)
      const compact = ctx.where == 'compact-editor'

      function set(o) {
        contentObs.set(Object.assign({}, contentObs(), o))
      }

      const renderStr = Str({
        save: name => set({name})
      })

      const pre = h('pre.editor', textObs())

      const editor = ace.edit(pre)
      if (opts.ace_theme) editor.setTheme(opts.ace_theme)
      //editor.session.setMode('ace/mode/css')

      editor.session.on('change', Changes(editor, 600, (err, content) => {
        set(content)
      }))

      editor.session.on('changeAnnotation', () => {
        const ans = editor.session.getAnnotations()
        if (ans.length !== 0) {
          syntaxErrorObs.set(ans[0].text)
        } else {
          syntaxErrorObs.set(null)
        }
      })

      function setNewContent(newContent) {
        const oldText = editor.session.getValue()
        if (newContent.text == oldText) return

        const currentPosition = editor.selection.getCursor()
        const scrollTop = editor.session.getScrollTop()
        editor.session.setValue(newContent.text)
        editor.clearSelection()
        editor.gotoLine(currentPosition.row + 1, currentPosition.column);
        editor.session.setScrollTop(scrollTop)
      }

      const abort = watch(contentObs, newContent => {
        setNewContent(newContent)
      })

      return h(`.tre-texttrack-editor${compact ? '.compact': ''}`, {
        hooks: [el => abort]
      }, [
        h('h1', renderStr(computed(nameObs, n => n ? n : 'No Name'))),
        pre,
        h('div', [
          // TODO move to editor shell
          h('span.bytesLeft', computed(contentLengthObs, len => `${8192 - 512 - len} characters left`)),
          h('span.error', syntaxErrorObs)
        ])
      ])
    }

  }
}

module.exports.importFiles = importFiles
module.exports.factory = factory

// -- utils

function Changes(editor, ms, cb) {
  return debounce(ms, ()=>{
    const text = editor.session.getValue() 
    const content = {text}
    cb(null, content)
  })
}

function debounce(ms, f) {
  let timerId

  return function() {
    if (timerId) clearTimeout(timerId)
    timerId = setTimeout(()=>{
      timerid = null
      f()
    }, ms)
  }
}

