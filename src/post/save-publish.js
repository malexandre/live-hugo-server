const fs = require('../promise-fs/')
const frontMatter = require('front-matter')
const slugify = require('slugify')
const winston = require('winston')

const buildJsonResponse = require('./build-json-response')
const { postFolder } = require('../config')

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

const save = async(post, oldPath) => {
    const yamlData = frontMatter(post)
    const filename = `${slugify(yamlData.attributes.title.toLowerCase())}.md`
    const path = `${postFolder}/${filename}`

    let oldFile
    try {
        oldFile = await fs.readFileAsync(oldPath || path, 'utf8')
    }
    catch (e) {
        if (oldPath || !e.message.includes('ENOENT')) {
            winston.error(`Post.save: Error while reading old file: path(${path}) oldPath(${oldPath})`, e)
            throw e
        }
    }
    const oldYamlData = oldFile ? frontMatter(oldFile) : undefined

    winston.info(`Post.save: Saving post ${filename} (${oldYamlData ? 'edit' : 'new'}):`, yamlData)
    await fs.writeFileAsync(
        path,
        setDraftStatus(post, yamlData.attributes.draft, oldYamlData ? !!oldYamlData.attributes.draft : true)
    )

    if (oldPath) {
        winston.info('Post.save: Deleting old file at', oldPath)
        await fs.unlinkAsync(oldPath)
    }

    const postJson = Object.assign({ content: yamlData.body }, yamlData.attributes)
    if (postJson.categories) {
        postJson.categories = postJson.categories.split(',')
    }
    return buildJsonResponse(yamlData)
}

const setPublish = async(path, publishStatus) => {
    let file
    try {
        file = await fs.readFileAsync(path, 'utf8')
    }
    catch (e) {
        winston.error('Post.save: Error while reading old file', e)
        throw e
    }

    const yamlData = frontMatter(file)

    winston.info(`Post.setPublish: Setting post ${path} draft status to ${!publishStatus} from:`, yamlData)

    const newFile = setDraftStatus(file, yamlData.attributes.draft, !publishStatus)

    if (newFile !== file) {
        await fs.writeFileAsync(path, newFile)
        return buildJsonResponse(frontMatter(newFile))
    }

    return buildJsonResponse(yamlData)
}

module.exports = { setPublish, save }
