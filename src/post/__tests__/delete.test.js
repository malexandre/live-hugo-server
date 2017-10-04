const fs = require('fs')
const mockFs = require('mock-fs')
const Post = require('../')
const Git = require('../../git')
const { initMockFs } = require('./setup-common')

jest.mock('../../config', () => ({
    postFolder: 'content/post',
    uploadFolder: 'assets/img'
}))

jest.mock('../../git', () => ({
    syncFiles: jest.fn()
}))

beforeEach(() => initMockFs())
afterEach(() => {
    mockFs.restore()
    Git.syncFiles.mockClear()
})

test('Deleting an existing post should delete it in the file system', async() => {
    const path = 'content/post/post-1.md'
    await Post.del(path)
    expect(() => fs.readFileSync(path, 'utf8')).toThrowError('ENOENT')
})

test('Deleting an existing post should call Git.syncFiles with the right commit message', async() => {
    const path = 'content/post/post-1.md'
    await Post.del(path)
    expect(Git.syncFiles).toBeCalledWith('[HugoLive] Delete post: post-1.md')
})

test('Deleting an non-existing post should do nothing', async() => {
    expect.assertions(2)
    try {
        await Post.del('fake path')
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
    expect(Git.syncFiles).not.toBeCalledWith()
})
