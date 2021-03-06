const { folders } = require('../config')

const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const git = require('simple-git')(folders.git)

const { promisify } = require('util')

const buildAsyncMethods = (moduleToPromisify, methods) => {
    const asyncMethods = {}
    methods.forEach((method) => (asyncMethods[`${method}Async`] = promisify(moduleToPromisify[method])))
    return asyncMethods
}

const promisifyModule = (moduleToPromisify, methods) => {
    return Object.assign({}, moduleToPromisify, buildAsyncMethods(moduleToPromisify, methods))
}

module.exports = {
    childProcess: promisifyModule(childProcess, ['exec']),
    crypto: promisifyModule(crypto, ['randomBytes']),
    fs: promisifyModule(fs, ['mkdir', 'readdir', 'readFile', 'rename', 'rmdir', 'stat', 'unlink', 'writeFile']),
    simpleGit: promisifyModule(git, ['commit', 'status'])
}
