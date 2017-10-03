const del = require('./delete')
const get = require('./get')
const list = require('./list')
const savePublish = require('./save-publish')

module.exports = Object.assign({ delete: del, get, list }, savePublish)
