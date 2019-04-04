const REGEX = {
  urlHexPairs: /%[\dA-F]{2}/g
}

function dataURIPayload(string) {
  return encodeURIComponent(string)
    .replace(REGEX.urlHexPairs, specialHexEncode);
}

function specialHexEncode(match) {
  switch (match) { // Browsers tolerate these characters, and they're frequent
    case '%20': return ' ';
    case '%3D': return '=';
    case '%3A': return ':';
    case '%2F': return '/';
    default: return match
  }
}

module.exports = function tinyDataUri(text, mimeType) {
  if (typeof text !== 'string') {
    throw new TypeError('Expected a string, but received ' + typeof text);
  }
  // Strip the Byte-Order Mark if the text has one
  if (text.charCodeAt(0) === 0xfeff) { text = text.slice(1) }
  const body = text.trim()
  return 'data:' + mimeType + ',' + dataURIPayload(body);
}

