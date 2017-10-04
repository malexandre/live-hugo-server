const fs = require('fs')
const { promisify } = require('util')

module.exports = Object.assign({}, fs, {
    readdirAsync: promisify(fs.readdir),
    readFileAsync: promisify(fs.readFile),
    renameAsync: promisify(fs.rename),
    statAsync: promisify(fs.stat),
    unlinkAsync: promisify(fs.unlink),
    writeFileAsync: promisify(fs.writeFile)
})
