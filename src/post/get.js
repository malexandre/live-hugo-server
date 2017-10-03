const fs = require('fs-extra')
const frontMatter = require('front-matter')
const winston = require('winston')

const buildJsonResponse = require('./build-json-response')

const get = (path) => {
    let file
    try {
        file = fs.readFileSync(path, 'utf8')
    }
    catch (e) {
        winston.error('Post.save: Error while reading old file', e)
        throw e
    }

    return buildJsonResponse(frontMatter(file))
}

module.exports = get
