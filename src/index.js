'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const winston = require('winston')

const { port, tokenExpiration } = require('./config')
const { buildApi } = require('./rest')
const { accessTokenStrategy, getNewAccessToken } = require('./auth/access-token')
const { localStrategy, getNewRefreshToken } = require('./auth/password')

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

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    res.cookie(
        'refreshToken',
        { email: req.user.email, token: getNewRefreshToken(req.user.email) },
        { maxAge: tokenExpiration.refresh, httpOnly: true, secure: true }
    )
    res.redirect('/')
})

app.post('/token', (req, res) => {
    const cookieData = JSON.parse(req.cookies.refreshToken)
    const token = getNewAccessToken(cookieData.email, cookieData.token)

    if (!token) {
        res.sendStatus(401)
    }

    res.status(200).json({ token, maxAge: tokenExpiration.access })
})

app.listen(port, function() {
    winston.info(`live-hugo listening on port ${port}`)
})
