const get = require('./get')
const list = require('./list')
const savePublish = require('./save-publish')

module.exports = Object.assign({ get, list }, savePublish)
