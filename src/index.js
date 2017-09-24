'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const winston = require('winston')

const { port } = require('./config')
const { buildApi } = require('./rest')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

buildApi(app)

app.listen(port, function() {
    winston.info(`live-hugo listening on port ${port}`)
})
