const fs = require('fs')
const mockFs = require('mock-fs')
const Post = require('../')
const { initMockFs } = require('./setup-common')

jest.mock('../../config', () => ({
    postFolder: 'content/post',
    uploadFolder: 'assets/img'
}))

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Deleting an existing post should delete it in the file system', async() => {
    const path = 'content/post/post-1.md'
    await Post.del(path)
    expect(() => fs.readFileSync(path, 'utf8')).toThrowError('ENOENT')
})

test('Deleting an non-existing post should do nothing', async() => {
    expect.assertions(1)
    try {
        await Post.del('fake path')
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
})
