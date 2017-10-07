const _ = require('lodash')
const { fs } = require('../promisified-libs')
const frontMatter = require('front-matter')
const moment = require('moment')
const slugify = require('slugify')
const winston = require('winston')

const { folders } = require('../config')

const filterAttributes = (attributes, filter = '') => {
    filter = slugify(filter)
    const { title = '' } = attributes // Check categories and description also?

    if (title.includes(filter)) {
        return true
    }

    return false
}

const list = async(options = {}) => {
    const { filter = undefined, offset = 0, count = 10, orderby = ['-date'] } = options

    const found = []

    let files = []
    try {
        files = await fs.readdirAsync(folders.post)
    }
    catch (e) {
        winston.error('Post.list: Error listing files from folder', e)
        throw e
    }

    for (let idx = 0; idx < files.length; ++idx) {
        const file = files[idx]
        const path = `${folders.post}/${file}`
        let data
        try {
            data = await fs.readFileAsync(path, 'utf8')
        }
        catch (e) {
            winston.error(`Post.list: Error while reading file ${folders.post}/${file}:`, e)
            continue
        }
        const attributes = frontMatter(data).attributes
        if (filterAttributes(attributes, filter)) {
            found.push({
                path,
                title: attributes.title,
                date: moment(attributes.date).valueOf(),
                categories: attributes.categories
            })
        }
    }

    const ordered = _.orderBy(
        found,
        orderby.map((item) => item.replace(/^-/, '')),
        orderby.map((item) => (item[0] === '-' ? 'desc' : 'asc'))
    )

    return {
        items: ordered.slice(offset, offset + count),
        more: ordered.slice(offset, offset + count + 1).length > count
    }
}

module.exports = list
