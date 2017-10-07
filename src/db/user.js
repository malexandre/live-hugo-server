const bcrypt = require('bcrypt')
const winston = require('winston')

const { bcryptSaltRounds } = require('../config')
const database = require('./database')

const newUser = async(email, password, firstname, lastname, avatar) => {
    return { email, password: await bcrypt.hash(password, bcryptSaltRounds), firstname, lastname, avatar }
}

const save = async(user) => await database.saveObject('user', user.email, user)

const get = async(email) => {
    try {
        return await database.getObject('user', email)
    }
    catch (e) {
        winston.warn('user.get: Error while fetching user', email, e)
    }
}

const checkUser = async(email, password) => {
    const dbUser = await get(email)

    if (!dbUser) {
        winston.warn('user.checkUser: User not found', email)
        return false
    }

    if (!await bcrypt.compare(password, dbUser.password)) {
        winston.warn('user.checkUser: Invalid password', email)
        return false
    }

    return true
}

module.exports = { checkUser, newUser, saveUser: save }
