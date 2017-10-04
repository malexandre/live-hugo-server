const fs = require('fs')
const { promisify } = require('util')

const methodList = ['readdir', 'readFile', 'rename', 'rmdir', 'stat', 'unlink', 'writeFile']

const buildAsyncMethods = () => {
    const asyncMethods = {}
    methodList.forEach((method) => (asyncMethods[`${method}Async`] = promisify(fs[method])))
    return asyncMethods
}

module.exports = Object.assign({}, fs, buildAsyncMethods())
