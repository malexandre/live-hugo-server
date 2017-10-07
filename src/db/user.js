const bcrypt = require('bcrypt')
const winston = require('winston')

const { bcryptSaltRounds, initialUser } = require('../config')
const database = require('./database')

const newUser = async(email, password, firstname, lastname, avatar) => {
    winston.info('user.newUser : Creating a new user', email, bcryptSaltRounds)
    const bcryptedPassword = await bcrypt.hash(password, bcryptSaltRounds)
    return { email, password: bcryptedPassword, firstname, lastname, avatar }
}

const save = async(user) => {
    winston.info('user.save : Saving user', user.email)
    await database.saveObject('user', user.email, user)
}

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

const createInitialUser = async() => {
    if ((await get(initialUser.email)) === null) {
        await save(
            await newUser(
                initialUser.email,
                initialUser.password,
                initialUser.firstname,
                initialUser.lastname,
                initialUser.avatar
            )
        )
    }
}

module.exports = { checkUser, createInitialUser, newUser, getUser: get, saveUser: save }
