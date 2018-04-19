// this is a utility loader that takes a *.vue file, parses it and returns
// the requested language block, e.g. the content inside <template>, for
// further processing.

const path = require('path')
const parse = require('./parser')
const loaderUtils = require('loader-utils')

module.exports = function (content) {
  this.cacheable()
  const query = loaderUtils.getOptions(this) || {}
  const context = (this._compiler && this._compiler.context) || this.options.context || process.cwd()
  let filename = path.basename(this.resourcePath)
  filename = filename.substring(0, filename.lastIndexOf(path.extname(filename))) + '.vue'
  const sourceRoot = path.dirname(path.relative(context, this.resourcePath))
  const parts = parse(content, filename, this.sourceMap, sourceRoot, query.bustCache)

  let type = query.type
  if (query.type === 'template') {
    type = 'templates'
  } else if (query.type === 'script') {
    type = 'scripts'
  }
  let part = parts[type]

  if (Array.isArray(part)) {
    const filtered = part.filter(p => p.attrs.hasOwnProperty(query.native ? 'native' : 'web'))
    if (query.index < filtered.length) {
      part = filtered[query.index]
    } else {
      part = part[query.index]
    }
  }
  this.callback(null, part.content, part.map)
}
