const fs = require('fs-extra')
const mockFs = require('mock-fs')
const Post = require('../')
const { initMockFs } = require('./setup-common')

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Deleting an existing post should delete it in the file system', async() => {
    const path = 'content/post/post-1.md'
    await Post.delete(path)
    expect(() => fs.readFileSync(path, 'utf8')).toThrowError('ENOENT')
})

test('Deleting an non-existing post should throw an error', async() => {
    expect.assertions(1)
    try {
        await Post.delete('fake path')
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
})
