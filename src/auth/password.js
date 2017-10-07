const passportLocal = require('passport-local')

const { newRefreshToken, saveRefreshToken } = require('../db/refresh-token')
const { checkUser, get } = require('../db/user')

const getNewRefreshToken = (email) => {
    const token = newRefreshToken(email)
    saveRefreshToken(token)
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
            next(null, await get(email))
        }
    }
)

module.exports = { getNewRefreshToken, localStrategy: strategy }
