const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const winston = require('winston')

const { tokenExpiration, jwtSecret } = require('../config')
const { checkRefreshToken } = require('../db/refresh-token')
const { user } = require('../db')

const jwtOptions = {}
jwtOptions.jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = jwtSecret

const getNewAccessToken = async(email, refreshToken) => {
    if (!await checkRefreshToken(email, refreshToken)) {
        winston.warn('getNewAccessToken: Invalid refresh token')
        return
    }
    return jwt.sign({ email }, jwtSecret, { expiresIn: tokenExpiration.access, algorithm: 'HS512' })
}

const strategy = new passportJWT.Strategy(jwtOptions, async(payload, next) => {
    const dbUser = await user.getUser(payload.email)
    if (dbUser) {
        next(null, dbUser)
    }
    else {
        next(null, false)
    }
})

module.exports = { getNewAccessToken, accessTokenStrategy: strategy }
