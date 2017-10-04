const mockFs = require('mock-fs')
const Post = require('../')
const { initMockFs } = require('./setup-common')

jest.mock('../../config', () => ({
    postFolder: 'content/post',
    uploadFolder: 'assets/img'
}))

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Fetching an existing post should return JSON data for the post', async() => {
    const post = await Post.get('content/post/post-1.md')
    expect(post).toEqual({
        content: 'My post',
        title: 'Post 1',
        date: new Date(1 * 1000)
    })
})

test('Fetching an non-existing post should throw an error', async() => {
    expect.assertions(1)
    try {
        await Post.get('fake path')
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
})
