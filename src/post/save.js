const fs = require('fs-extra')
const frontMatter = require('front-matter')
const slugify = require('slugify')
const winston = require('winston')

const save = async(post) => {
    const data = frontMatter(post)
    const filename = `${slugify(data.attributes.title.toLowerCase())}.md`

    winston.info(`Post.save: Saving post ${filename}:`, data)
    fs.writeFileSync(`content/post/${filename}`, post)

    const postJson = Object.assign({ content: data.body }, data.attributes)
    if (postJson.categories) {
        postJson.categories = postJson.categories.split(',')
    }
    return postJson
}

module.exports = save
