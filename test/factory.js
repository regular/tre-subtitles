const test = require('tape')
const {factory} = require('../common')

test('factory', t => {
  const result = factory({})
  t.ok(result.type, 'has type')
  t.ok(result.i18n.en, 'has name in english')
  t.equal(typeof result.prototype, 'function', 'has prototype function')
  t.equal(typeof result.content, 'function', 'has content function')

  const proto = result.prototype()
  t.ok(proto, 'prototype() returns a prototype')
  t.ok(proto.type, 'prototype has type')
  t.ok(proto.schema, 'prototype has schema')
  t.end()
})
