const fs = require('fs-extra')
const frontMatter = require('front-matter')
const slugify = require('slugify')
const winston = require('winston')

const setDraftStatus = (post, isAlreadyDraft = false, isOldVersionDraft = true) => {
    if (!isAlreadyDraft && isOldVersionDraft) {
        winston.info('Adding draft status')
        post = post.replace(/^---\n/, '---\ndraft: true\n')
    }
    else if (isAlreadyDraft && !isOldVersionDraft) {
        winston.info('Removing draft status')
        post = post.replace(/^(---[\S\s]*?)draft: true\s([\S\s]*?---)/, '$1$2')
    }

    return post
}

const save = async(post) => {
    const data = frontMatter(post)
    const filename = `${slugify(data.attributes.title.toLowerCase())}.md`
    const path = `content/post/${filename}`

    let oldFile
    try {
        oldFile = fs.readFileSync(path, 'utf8')
    }
    catch (e) {
        if (!e.message.includes('ENOENT')) {
            winston.error('Post.save: Error while reading old file', e)
            return
        }
    }
    const oldData = oldFile ? frontMatter(oldFile) : undefined

    winston.info(`Post.save: Saving post ${filename} (${oldData ? 'edit' : 'new'}):`, data)
    fs.writeFileSync(path, setDraftStatus(post, data.attributes.draft, oldData ? !!oldData.attributes.draft : true))

    const postJson = Object.assign({ content: data.body }, data.attributes)
    if (postJson.categories) {
        postJson.categories = postJson.categories.split(',')
    }
    return postJson
}

module.exports = save
