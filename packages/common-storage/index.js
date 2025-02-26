'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/storage-utils.cjs.prod.js')
} else {
  module.exports = require('./dist/storage-utils.cjs.js');
}
