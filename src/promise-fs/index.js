const fs = require('fs')
const { promisify } = require('util')

module.exports = Object.assign({}, fs, {
    readdirAsync: promisify(fs.readdir),
    readFileAsync: promisify(fs.readFile),
    writeFileAsync: promisify(fs.writeFile),
    unlinkAsync: promisify(fs.unlink)
})
