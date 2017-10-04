const { fs } = require('../promisified-libs')
const path = require('path')
const winston = require('winston')

const { uploadFolder } = require('../config')
const checkImageFolderExists = require('./check-image-folder-exists')
const { syncFiles } = require('../git')

const rmdir = async(dir) => {
    const list = await fs.readdirAsync(dir)
    for (let i = 0; i < list.length; i++) {
        const filename = path.join(dir, list[i])
        const stats = await fs.statAsync(filename)

        if (filename == '.' || filename == '..') {
            // pass these files
        }
        else if (stats.isDirectory()) {
            rmdir(filename)
        }
        else {
            await fs.unlinkAsync(filename)
        }
    }
    await fs.rmdirAsync(dir)
}

const del = async(path) => {
    try {
        const filename = `${path.split('/').pop()}`
        const imageFolder = `${uploadFolder}/${filename.replace(/\.md$/, '')}`
        await fs.unlinkAsync(path)
        await syncFiles(`[HugoLive] Delete post: ${filename}`)
        if (await checkImageFolderExists(imageFolder)) {
            await rmdir(imageFolder)
        }
    }
    catch (e) {
        winston.error('Post.delete: Error while deleting file', path, e)
        throw e
    }
}

module.exports = del
