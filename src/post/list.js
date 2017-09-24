const _ = require('lodash')
const fs = require('fs-extra')
const frontMatter = require('front-matter')
const moment = require('moment')
const winston = require('winston')

const { postFolder } = require('../config')

const list = async(options = {}) => {
    options = Object.assign(
        {
            filter: undefined,
            orderby: ['-date'],
            offset: 0,
            count: 10
        },
        options
    )

    if (!Array.isArray(options.orderby)) {
        options.orderby = [options.orderby]
    }

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
        if (attributes.title && (!options.filter || attributes.title.includes(options.filter))) {
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
        options.orderby.map((item) => item.replace(/^-/, '')),
        options.orderby.map((item) => (item[0] === '-' ? 'desc' : 'asc'))
    )

    return {
        items: ordered.slice(options.offset, options.offset + options.count),
        more: ordered.slice(options.offset, options.offset + options.count + 1).length > options.count
    }
}

module.exports = list
