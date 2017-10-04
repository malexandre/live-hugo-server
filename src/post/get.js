const fs = require('../promisified-libs/fs')
const frontMatter = require('front-matter')
const winston = require('winston')

const buildJsonResponse = require('./build-json-response')

const get = async(path) => {
    let file
    try {
        file = await fs.readFileAsync(path, 'utf8')
    }
    catch (e) {
        winston.error('Post.save: Error while reading old file', e)
        throw e
    }

    return buildJsonResponse(frontMatter(file))
}

module.exports = get
