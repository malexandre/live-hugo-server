const fs = require('../promise-fs/')
const winston = require('winston')

const { syncFiles } = require('../git')

const del = async(path) => {
    try {
        await fs.unlinkAsync(path)
        await syncFiles(`[HugoLive] Delete post: ${path.split('/').pop()}`)
    }
    catch (e) {
        winston.error('Post.delete: Error while deleting file', path, e)
        throw e
    }
}

module.exports = del
