const fs = require('fs')
const mockFs = require('mock-fs')
const Post = require('../')
const Git = require('../../git')
const { generatePost, initMockFs } = require('./setup-common')

jest.mock('../../config', () => ({
    folders: {
        post: 'content/post',
        upload: 'assets/img'
    }
}))

jest.mock('../../git', () => ({
    syncFiles: jest.fn()
}))

beforeEach(() => initMockFs())
afterEach(() => {
    mockFs.restore()
    Git.syncFiles.mockClear()
})

test('Publishing an existing draft should remove the draft status', async() => {
    const path = 'content/post/random-6.md'
    const sentNotDraftData = generatePost(6, 'Random 6')
    const oldData = fs.readFileSync(path, 'utf8')
    await Post.setPublish(path, true)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).toBe(sentNotDraftData)
    expect(data).not.toBe(oldData)
    expect(Git.syncFiles).toBeCalledWith('[HugoLive] Publish post: random-6.md')
})

test('Unpublishing an existing draft should make no change', async() => {
    const path = 'content/post/random-6.md'
    const sentNotDraftData = generatePost(6, 'Random 6')
    const oldData = fs.readFileSync(path, 'utf8')
    await Post.setPublish(path, false)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).not.toBe(sentNotDraftData)
    expect(data).toBe(oldData)
    expect(Git.syncFiles).not.toBeCalled()
})

test('Publishing an existing published version should make no change', async() => {
    const path = 'content/post/post-1.md'
    const sentDraftData = generatePost(1, 'Post 1').replace('---', '---\ndraft: true')
    const oldData = fs.readFileSync(path, 'utf8')
    await Post.setPublish(path, true)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).not.toBe(sentDraftData)
    expect(data).toBe(oldData)
    expect(Git.syncFiles).not.toBeCalled()
})

test('Unpublishing an existing published version should add the draft status', async() => {
    const path = 'content/post/post-1.md'
    const sentDraftData = generatePost(1, 'Post 1').replace('---', '---\ndraft: true')
    const oldData = fs.readFileSync(path, 'utf8')
    await Post.setPublish(path, false)
    const data = fs.readFileSync(path, 'utf8')
    expect(data).toBe(sentDraftData)
    expect(data).not.toBe(oldData)
    expect(Git.syncFiles).toBeCalledWith('[HugoLive] Unpublish post: post-1.md')
})

test('Publishing a non-existant file should throw an error', async() => {
    expect.assertions(2)
    try {
        await Post.setPublish('fake path', true)
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
    expect(Git.syncFiles).not.toBeCalled()
})

test('Unpublishing a non-existant file should throw an error', async() => {
    expect.assertions(2)
    try {
        await Post.setPublish('fake path', false)
    }
    catch (e) {
        expect(e.code).toBe('ENOENT')
    }
    expect(Git.syncFiles).not.toBeCalled()
})
