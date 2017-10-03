const fs = require('../promise-fs/')
const winston = require('winston')

const del = async(path) => {
    try {
        await fs.unlinkAsync(path)
    }
    catch (e) {
        winston.error('Post.delete: Error while deleting file', path, e)
        throw e
    }
}

module.exports = del
