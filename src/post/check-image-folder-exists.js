const { fs } = require('../promisified-libs')
const winston = require('winston')

const checkImageFolderExists = async(imageFolder) => {
    winston.info('checkImageFolderExists: Check if images folder exists', imageFolder)
    try {
        const stats = await fs.statAsync(imageFolder)
        if (!stats.isDirectory()) {
            throw new Error('checkImageFolderExists: is not a folder', imageFolder)
        }
        return true
    }
    catch (e) {
        // Folder don't exist, do nothing
        if (e.message.includes('checkImageFolderExists')) {
            winston.error(e)
        }
        winston.info('checkImageFolderExists: No image folder!', e)
    }
    return false
}

module.exports = checkImageFolderExists
