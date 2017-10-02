const _ = require('lodash')
const fs = require('fs-extra')
const frontMatter = require('front-matter')
const moment = require('moment')
const slugify = require('slugify')
const winston = require('winston')

const { postFolder } = require('../config')

const filterAttributes = (attributes, filter = '') => {
    filter = slugify(filter)
    const { title = '' } = attributes  // Check categories and description also?

    if (title.includes(filter)) {
        return true
    }

    return false
}

const list = async(options = {}) => {
    let orderby = ['-date']
    if (options.orderby && !Array.isArray(options.orderby)) {
        orderby = [options.orderby]
    }
    else if (options.orderby) {
        orderby = options.orderby
    }

    const { filter = undefined, offset = 0, count = 10 } = options

    const found = []

    let files = []
    try {
        files = await fs.readdir(postFolder)
    }
    catch (e) {
        winston.error('Post.list: Error listing files from folder', e)
        throw e
    }

    files.forEach(async(file) => {
        let data
        try {
            data = fs.readFileSync(`${postFolder}/${file}`, 'utf8')
        }
        catch (e) {
            winston.error('Post.list: Error while reading file', e)
            return
        }
        const attributes = frontMatter(data).attributes
        if (filterAttributes(attributes, filter)) {
            found.push({
                path: `${postFolder}/${file}`,
                title: attributes.title,
                date: moment(attributes.date).valueOf(),
                categories: attributes.categories
            })
        }
    })

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
