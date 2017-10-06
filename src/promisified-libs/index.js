const { gitFilder } = require('../config')

const childProcess = require('child_process')
const fs = require('fs')
const git = require('simple-git')(gitFilder)

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
    fs: promisifyModule(fs, ['mkdir', 'readdir', 'readFile', 'rename', 'rmdir', 'stat', 'unlink', 'writeFile']),
    simpleGit: promisifyModule(git, ['commit', 'status'])
}
