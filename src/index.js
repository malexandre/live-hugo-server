'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const winston = require('winston')

const asyncMiddleware = require('./async-middleware')
const { port, tokenExpiration } = require('./config')
const { buildApi } = require('./rest')
const { accessTokenStrategy, getNewAccessToken } = require('./auth/access-token')
const { localStrategy, getNewRefreshToken } = require('./auth/password')
const { createInitialUser } = require('./db/user')

passport.use(accessTokenStrategy)
passport.use(localStrategy)

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())

app.use(function(req, res, next) {
    if (!req.secure && process.env.NODE_ENV === 'production') {
        res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` })
        res.end()
    }
    next()
})

buildApi(app, passport)

app.post(
    '/login',
    passport.authenticate('local', { session: false }),
    asyncMiddleware(async(req, res) => {
        const token = await getNewRefreshToken(req.user.email)
        res.cookie(
            'refreshToken',
            { email: req.user.email, token },
            { maxAge: tokenExpiration.refresh * 1000, httpOnly: true, secure: process.env.NODE_ENV === 'production' }
        )
        res.redirect('/')
    })
)

app.post(
    '/token',
    asyncMiddleware(async(req, res) => {
        const cookieData = req.cookies.refreshToken
        const token = await getNewAccessToken(cookieData.email, cookieData.token)

        if (!token) {
            res.sendStatus(401)
        }

        res.status(200).json({ token, maxAge: tokenExpiration.access })
    })
)

// app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client/dist/index.html')))

app.listen(port, function() {
    winston.info(`live-hugo listening on port ${port}`)
    createInitialUser()
})
