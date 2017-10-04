const winston = require('winston')

const { buildCmd } = require('../config')
const { childProcess } = require('../promisified-libs')

const build = async(asyncMode = true) => {
    winston.info('Calling build command', buildCmd)
    ;(asyncMode ? childProcess.execAsync : childProcess.exec)(buildCmd)
}

module.exports = { build }
