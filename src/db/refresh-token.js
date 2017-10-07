const bcrypt = require('bcrypt')
const winston = require('winston')

const { bcryptSaltRounds, tokenExpiration } = require('../config')
const { crypto } = require('../promisified-libs')
const database = require('./database')

const newRefreshToken = async(email) => {
    const data = (await crypto.randomBytesAsync(1024)).toString('base64')
    return {
        email,
        data,
        expiration: tokenExpiration.refresh
    }
}

const save = async(token) => {
    const bcrypted = await bcrypt.hash(token.data, bcryptSaltRounds)
    await database.saveObject('token', bcrypted, Object.assign({}, token, { data: bcrypted }))
}

const get = async(data) => await database.getObject('token', data)

const checkRefreshToken = async(email, token) => {
    const bcrypted = await bcrypt.hash(token.data, bcryptSaltRounds)
    const dbToken = await get(bcrypted)

    if (!dbToken) {
        winston.warn('checkRefreshToken: Invalid refresh token, might be expired', email, bcrypted)
        return false
    }

    if (email !== dbToken.email) {
        winston.warn(`checkRefreshToken: Invalid refresh token, bad email: db(${dbToken.email}) req(${email})`)
        return false
    }

    return true
}

module.exports = { checkRefreshToken, newRefreshToken, saveRefreshToken: save }
