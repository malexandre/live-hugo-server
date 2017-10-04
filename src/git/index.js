const { simpleGit } = require('../promisified-libs')
const winston = require('winston')

const syncFiles = async(message) => {
    if (!message) {
        throw new Error('Git.syncFiles: A commit message must be given')
    }

    const status = await simpleGit.statusAsync()

    if (status.not_added && status.not_added.length > 0) {
        winston.info('Git.syncFiles: Commiting changes:', status.not_added)
        await simpleGit.commitAsync(message, status.not_added)
    }
    else {
        winston.info('Git.syncFiles: No change to commit')
    }
}

module.exports = { syncFiles }
