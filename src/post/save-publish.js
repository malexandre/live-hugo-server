const { fs } = require('../promisified-libs')
const frontMatter = require('front-matter')
const slugify = require('slugify')
const winston = require('winston')

const buildJsonResponse = require('./build-json-response')
const checkImageFolderExists = require('./check-image-folder-exists')
const { folders } = require('../config')
const { syncFiles } = require('../git')

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
    const path = `${folders.post}/${filename}`
    let commitMessage = `[HugoLive] ${oldPath ? 'Edit' : 'New'} post: ${filename}`

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
        commitMessage = `[HugoLive] Move post: ${oldFilename} to ${filename}`

        const imagePath = `${folders.upload}/${slug}`
        const oldImagePath = oldFilename ? `${folders.upload}/${oldFilename.replace(/\.md$/, '')}` : undefined
        if (oldImagePath && (await checkImageFolderExists(oldImagePath))) {
            winston.info(`Post.save: moving ${oldImagePath} to ${imagePath}`)
            await fs.renameAsync(oldImagePath, imagePath)
        }
    }

    await syncFiles(commitMessage)

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
        syncFiles(`[HugoLive] ${publishStatus ? 'Publish' : 'Unpublish'} post: ${path.split('/').pop()}`)
        return buildJsonResponse(frontMatter(newFile))
    }

    return buildJsonResponse(yamlData)
}

module.exports = { setPublish, save }
