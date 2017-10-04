const { gitFilder } = require('../config')()
const git = require('simple-git')(gitFilder)
const { promisify } = require('util')

module.exports = Object.assign({}, git, {
    commitAsync: promisify(git.commit),
    statusAsync: promisify(git.status)
})
