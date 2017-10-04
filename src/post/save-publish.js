const fs = require('../promise-fs/')
const frontMatter = require('front-matter')
const slugify = require('slugify')
const winston = require('winston')

const buildJsonResponse = require('./build-json-response')
const { uploadFolder, postFolder } = require('../config')

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

const getOldFileYamlData = async(path, oldPath) => {
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
    return oldFile ? frontMatter(oldFile) : undefined
}

const checkIfPathIsAlreadyUsed = async(path, oldPath) => {
    if (path === oldPath) {
        // No error to throw
        return
    }

    try {
        await fs.readFileAsync(path, 'utf8')
    }
    catch (e) {
        if (e.message.includes('ENOENT')) {
            // No error to throw
            return
        }
    }

    throw new Error('Post.save: Path already used by another file', path)
}

const save = async(post, oldPath) => {
    const yamlData = frontMatter(post)
    const slug = slugify(yamlData.attributes.title.toLowerCase())
    const filename = `${slug}.md`
    const oldFilename = oldPath ? oldPath.split('/').pop() : undefined
    const path = `${postFolder}/${filename}`
    const imagePath = `${uploadFolder}/${slug}`
    const oldImagePath = oldFilename ? `${uploadFolder}/${oldFilename.replace(/\.md$/, '')}` : undefined

    await checkIfPathIsAlreadyUsed(path, oldPath)

    const oldYamlData = await getOldFileYamlData(path, oldPath)

    winston.info(`Post.save: Saving post ${filename} (${oldYamlData ? 'edit' : 'new'}):`, yamlData)
    await fs.writeFileAsync(
        path,
        setDraftStatus(post, yamlData.attributes.draft, oldYamlData ? !!oldYamlData.attributes.draft : true)
    )

    if (oldPath && oldPath !== path) {
        winston.info('Post.save: Deleting old file at', oldPath)
        await fs.unlinkAsync(oldPath)

        winston.info('Post.save: Check if images folder exists')
        let exists = false
        try {
            const stats = await fs.statAsync(oldImagePath)
            if (!stats.isDirectory()) {
                throw new Error('Post.save: Old image path is not a folder', oldImagePath)
            }
            exists = true
        }
        catch (e) {
            // Folder don't exist, do nothing
            if (e.message.includes('Post.save')) {
                winston.error(e)
            }
            winston.info('Post.save: No image folder!', e)
        }

        if (exists) {
            winston.info(`Post.save: moving ${oldImagePath} to ${imagePath}`)
            await fs.renameAsync(oldImagePath, imagePath)
        }
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
