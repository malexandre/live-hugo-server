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

const buildJsonResponse = (yamlData) => {
    const postJson = Object.assign({ content: yamlData.body }, yamlData.attributes)
    if (postJson.categories) {
        postJson.categories = postJson.categories.split(',')
    }
    return postJson
}

const save = (post, oldPath) => {
    const yamlData = frontMatter(post)
    const filename = `${slugify(yamlData.attributes.title.toLowerCase())}.md`
    const path = `content/post/${filename}`

    let oldFile
    try {
        oldFile = fs.readFileSync(oldPath || path, 'utf8')
    }
    catch (e) {
        if (oldPath || !e.message.includes('ENOENT')) {
            winston.error(`Post.save: Error while reading old file: path(${path}) oldPath(${oldPath})`, e)
            throw e
        }
    }
    const oldYamlData = oldFile ? frontMatter(oldFile) : undefined

    winston.info(`Post.save: Saving post ${filename} (${oldYamlData ? 'edit' : 'new'}):`, yamlData)
    fs.writeFileSync(
        path,
        setDraftStatus(post, yamlData.attributes.draft, oldYamlData ? !!oldYamlData.attributes.draft : true)
    )

    if (oldPath) {
        winston.info('Post.save: Deleting old file at', oldPath)
        fs.unlinkSync(oldPath)
    }

    const postJson = Object.assign({ content: yamlData.body }, yamlData.attributes)
    if (postJson.categories) {
        postJson.categories = postJson.categories.split(',')
    }
    return buildJsonResponse(yamlData)
}

const setPublish = (path, publishStatus) => {
    let file
    try {
        file = fs.readFileSync(path, 'utf8')
    }
    catch (e) {
        winston.error('Post.save: Error while reading old file', e)
        throw e
    }

    const yamlData = frontMatter(file)

    winston.info(`Post.setPublish: Setting post ${path} draft status to ${!publishStatus} from:`, yamlData)

    const newFile = setDraftStatus(file, yamlData.attributes.draft, !publishStatus)

    if (newFile !== file) {
        fs.writeFileSync(path, newFile)
        return buildJsonResponse(frontMatter(newFile))
    }

    return buildJsonResponse(yamlData)
}

module.exports = { setPublish, save }
