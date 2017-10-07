const passportLocal = require('passport-local')

const { newRefreshToken, saveRefreshToken } = require('../db/refresh-token')
const { checkUser, getUser } = require('../db/user')

const getNewRefreshToken = async(email) => {
    const token = await newRefreshToken(email)
    token.salt = await saveRefreshToken(token)
    return token
}

const strategy = new passportLocal.Strategy(
    {
        usernameField: 'email',
        passwordField: 'passwd',
        session: false
    },
    async(email, password, next) => {
        if (!await checkUser(email, password)) {
            next(null, false)
        }
        else {
            next(null, await getUser(email))
        }
    }
)

module.exports = { getNewRefreshToken, localStrategy: strategy }
