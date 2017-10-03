const mockFs = require('mock-fs')
const Post = require('../')
const { initMockFs } = require('./setup-common')

beforeEach(() => initMockFs())
afterEach(() => mockFs.restore())

test('Fetching an existing post should return JSON data for the post', () => {
    const post = Post.get('content/post/post-1.md')
    expect(post).toEqual({
        content: 'My post',
        title: 'Post 1',
        date: new Date(1 * 1000)
    })
})

test('Fetching an non-existing post should throw an error', () => {
    expect(() => Post.get('fake path')).toThrowError('ENOENT')
})
